const app = require('./http/app');
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(` Serveur démarré sur http://localhost:${port}/rooms`);
});