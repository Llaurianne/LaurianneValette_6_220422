//Import du contenu extérieur : modules et fichiers
const mongoose = require('mongoose');
const express = require('express');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

//Création de l'application Express
const app = express();

//Connexion de l'API à la base de données Mongoose
mongoose.connect('mongodb+srv://admin:81otKOYKfei1FV4D@cluster0.eb8oj.mongodb.net/database?retryWrites=true&w=majority',
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

//Extraction du corps des requêtes en JSON
app.use(express.json());

//Paramétrage des headers des requêtes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //Accès à l'API depuis toutes les origines *
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); //Ajout de headers mentionnés aux requêtes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //Définition des méthodes autorisées
    next();
});

//Gestion des images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')));

//Enregistrement des routers  sauce et user
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

//Export de l'application
module.exports = app;