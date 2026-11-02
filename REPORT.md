# Rapport d'implémentation - Studio Riff

## 1. Architecture et Choix Techniques
L'application suit une architecture "DDD Lite" en 3 couches (HTTP, Domain, Infrastructure). 
Pour garantir des tests déterministes, la gestion du temps a été isolée via l'injection d'une dépendance `Clock` dans le `BookingService`.

## 2. Base de données et Sécurité
La règle d'interdiction de chevauchement des réservations est garantie de manière forte par la base de données PostgreSQL. J'ai utilisé l'extension `btree_gist` pour créer une contrainte `EXCLUDE USING gist`, empêchant toute insertion concurrente invalide au niveau de l'infrastructure.

## 3. Difficultés rencontrées et Solutions
**Conflit de port PostgreSQL :** Lors du lancement initial de Docker sur l'environnement Windows, le port standard `5432` était déjà occupé par un service PostgreSQL local fonctionnant en arrière-plan. 
*Solution :* Après avoir temporairement utilisé le port `5433` pour isoler le problème, j'ai identifié et arrêté le service Windows local via `services.msc`. Cela a permis de rétablir le fichier `compose.yaml` sur le port standard `5432`, garantissant ainsi une stricte conformité avec l'environnement attendu par le correcteur.

## 4. Tests
La logique métier du service de réservation est validée par des tests unitaires automatisés sous Jest (100% de réussite), en utilisant un mock du Repository et une horloge fixe.

## 5. Stratégie NoSQL (Valkey) - C11
Valkey est utilisé comme système de cache pour limiter les requêtes répétitives vers PostgreSQL, notamment pour la vérification des maintenances des salles.
* **Clés :** Format `room:{id}` (ex: `room:room-1`). Stocke les informations de la salle au format JSON.
* **Durée de vie (TTL) :** 1 heure. Les données de maintenance changent rarement, ce délai offre un bon compromis entre fraîcheur et performance.
* **Suppression :** Gérée automatiquement par l'expiration du TTL (éviction volatile-lru).
* **Repli (Fallback) :** En cas d'absence de la clé (cache miss) ou d'indisponibilité de Valkey, le système interroge directement PostgreSQL puis met à jour le cache Valkey de manière asynchrone pour les requêtes suivantes.

## 6. Arbitrage des données (PostgreSQL vs Valkey) - C12
* **Répartition :** PostgreSQL reste l'unique source de vérité (Source of Truth). Il gère les réservations car il garantit l'intégrité transactionnelle (ACID) et bloque les chevauchements via sa contrainte `EXCLUDE`. Valkey n'agit que comme un stockage éphémère (cache en lecture) pour les données annexes.
* **Taille de l'association :** Studio Riff étant une petite structure (4 salles, peu de membres), le volume global de données est très faible et tiendrait entièrement dans la RAM de Valkey. Cependant, la criticité des réservations (ne pas avoir deux groupes en même temps) justifie d'imposer PostgreSQL au centre. Le cache Valkey est ici une démonstration d'architecture scalable, qui protège la base de données en cas de pics de trafic soudains.

## 7. Plan de Sauvegarde (C13)
La restauration a été prouvée via un dump complet (`pg_dump`) réinjecté avec succès dans une base `studio_riff_restore`.
* **RPO (Recovery Point Objective) : 24 heures.** Une sauvegarde complète (Full Backup) automatisée chaque nuit est suffisante. L'association étant petite, la perte maximale d'une journée de saisie de réservations est gérable manuellement.
* **RTO (Recovery Time Objective) : 4 heures.** En cas de crash, ce délai permet de relancer le conteneur Docker et d'exécuter le script de restauration SQL.
* **Rétention : 30 jours.** Conservation des dumps quotidiens pendant un mois (rotation), offrant un compromis idéal entre sécurité et coût de stockage.