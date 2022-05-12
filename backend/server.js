//Import du contenu extérieur : modules et fichiers
const http = require('http');
const app = require('./app');

//Normalisation et création de la constante port
const normalizePort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {return val}
    if (port >= 0) {return port}
    return false;
};
const port = normalizePort(process.env.PORT || '3000');
//L'application tourne sur le port défini ci-dessus
app.set('port', port);

//Gestion des erreurs
const errorHandler = error => {
    if (error.syscall !== 'listen') {throw error}
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

//Création du serveur, et exécution de app à chaque requête
const server = http.createServer(app);

//Affichage de l'état du seveur dans la console du backend
server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

//Ecoute du port par le serveur
server.listen(port);
