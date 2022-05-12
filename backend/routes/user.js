//Import du contenu extérieur : modules et fichiers
const express = require('express');
const userCtrl = require('../controllers/user')

//Création du router Express
const router = express.Router();

//Définition des routes router.${methode}(${chemin}, ${middleware1}, ${middleware2}, ..., ${controlleur})
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

//Export du routeur
module.exports = router;