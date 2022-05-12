//Import du contenu extérieur : modules et fichiers
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//Création d'un nouvel utilisateur
exports.signup = (req, res, next) => {
    //Hachage du mot de passe récupéré dans la requête
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            //Enregistrement du nouvel utilisateur dans la BDD
            user.save()
                .then(() => res.status(201).json({message: 'New user created !'}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

//Connection d'un utilisateur existant
exports.login = (req, res, next) => {
    //Accès à l'utilisateur avec l'email contenu dans le corps de la requête
    User.findOne({ email:req.body.email})
        .then(user => {
            //Retourne une erreur si l'utilisateur n'existe pas
            if (!user) {
                return res.status(404).json({error: 'User not found'});
            }
            //Comparaison du hash stocké dans la BDD et du mot de passe renseigné à la connexion
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    //Retourne une erreur si le mot de passe est incorrect
                    if(!valid) {
                        return res.status(403).json({error: 'Incorrect password!'});
                    }
                    //Retourne le userId et un token valable pendant 24h si le mot de passe est correct
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};