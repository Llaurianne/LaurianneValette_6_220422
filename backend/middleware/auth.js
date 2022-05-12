//Import du contenu extérieur : modules et fichiers
const jwt = require('jsonwebtoken');

//Middleware d'authentification
module.exports = (req, res, next) => {
    try {
        //Récupère la 2ème partie (= token sans Bearer) du champs authorization des headers de la requête
        const token = req.headers.authorization.split(' ')[1];
        //Vérifie que le token est valide et en extrait le userId
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = { userId };
        //Vérifie lorsqu'il est présent que le userId contenu dans la requête est identique à celui du token
        if (req.body.userId && req.body.userId !== userId) {
            throw "User not authorized";
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({error : error});
    }
};