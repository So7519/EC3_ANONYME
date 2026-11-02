# Décisions d'Architecture et de Conception - Studio Riff

## 1. Schéma des couches (Architecture)

 le projet adopte une architecture en 3 couches (cet a dire une DDD) :


1. **Couche HTTP (Contrôleurs / Routes Express) :**
    Permet de gérer les requêtes, parser le JSON, valider le format des données entrantes, et renvoyer les bons codes de statut HTTP (200, 201, 400, 404, 409).
    *Ne contient aucune règle métier.*
2. **Couche Domaine (Services Métier) :**
    Il permet de contenir 100% de la logique métier de l'association. 
    Reçoit une interface `Clock` (horloge) en injection pour pouvoir figer le temps dans les tests.
3. **Couche Infrastructure (Repositories) :**
    Il exécute les requêtes vers PostgreSQL et Valkey.



[ Client HTTP ] ----> [ Routes/Contrôleurs (Express) ] ── (Traduit HTTP en appels de fonctions) ----> [ Services Métier (Domaine) ] ── (Applique les règles, utilise une Horloge injectée) ----> [ Repositories (Accès aux données) ] ──  (SQL, Cache) ----> [ PostgreSQL ]