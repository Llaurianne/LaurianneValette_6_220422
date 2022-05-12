//Import du contenu extérieur : modules et fichiers
const Sauce = require("../models/Sauce");
const fs = require('fs');

//Affichage de toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

//Affichage d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

//Création d'une sauce
exports.createSauce = (req, res, next) => {
    //Récupération des informations de la nouvelle sauce dans le corps de la requête
    const sauceObject = JSON.parse(req.body.sauce);
    //Création d'un nouvelle objet sur le format du schéma Sauce
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    //Enregistrement de la sauce dans la BDD
    sauce.save()
        .then(() => res.status(201).json({message: 'A new sauce had been created!'}))
        .catch(error => res.status(400).json({error}));
};

//Modification d'une sauce
exports.modifySauce = (req, res, next) => {
    //Création d'un nouvel objet sauceObject avec les informations contenues dans le corps de la requête
    //Différenciation des cas avec ou sans nouvelle image
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    //Accès à la sauce avec l'id contenu dans les paramètres de la requête
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            //Vérification du droit de modification de l'utilisateur
            if (sauce.userId !== req.auth.userId) {
                return res.status(403).json({ error : "Unauthorized request"});
            }
            //Mise à jour de la sauce dont l'id est celui contenu dans les paramètres de la requête
            Sauce.updateOne({_id: req.params.id }, {...sauceObject, _id: req.params.id})
                .then(() => {
                    res.status(201).json({message: 'Sauce updated successfully!'})
                })
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(404).json({error}));
};

//Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    //Accès à la sauce avec l'id contenu dans les paramètres de la requête
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            //Récupération du nom du fichier image
            const filename = sauce.imageUrl.split('/images/')[1];
            //Suppression du fichier image grâce à la méthode unlink du package fs
            fs.unlink(`images/${filename}`, () => {
                //Vérification de l'existence de la sauce et du droit de modification de l'utilisateur
                Sauce.findOne({_id: req.params.id})
                    .then((sauce) => {
                        if (!sauce) {
                            return res.status(404).json({error: 'Sauce not found'});
                        }
                        if (sauce.userId !== req.auth.userId) {
                            return res.status(401).json({error: new Error('Request forbidden')});
                        }
                        //Suppression de la sauce dans la BDD
                        Sauce.deleteOne({_id: req.params.id})
                            .then(() => {
                                res.status(200).json({message: 'Deleted!'});
                            })
                            .catch(error => res.status(400).json({error}))
                    });
            });
        })
        .catch(error => res.status(404).json({error}));
}

//Ajout ou suppression de like ou dislike
exports.likeSauce = (req, res, next) => {
    //Différenciation des actions à exécuter en fonction de la valeur de like dans la requête
    switch (req.body.like) {
        case -1 :
            //Accès à la sauce avec l'id contenu dans les paramètres de la requête
            Sauce.findOne({_id: req.params.id})
                .then( sauce => {
                    //Vérification de l'existence d'un like ou dislike
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        res.status(208).json({error : "Sauce already disliked"})
                    } else if (sauce.usersLiked.includes(req.body.userId)) {
                        res.status(208).json({error : "Sauce cannot be liked and disliked at the same time"})
                    } else {
                        //Mise à jour du nombre de dislikes et du tableau des utilisateurs ayant disliké
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: { dislikes: 1 },
                                $push: { usersDisliked: req.body.userId },}
                        )
                            .then(() => res.status(200).json({message: 'Dislike added!'}))
                            .catch(error => res.status(400).json({error}))
                    }
                })
                .catch(error => res.status(404).json({error}))
            break;
        case 0 :
            //Accès à la sauce avec l'id contenu dans les paramètres de la requête
            Sauce.findOne({_id: req.params.id})
                .then( sauce => {
                    //Cas d'un like existant
                    if ( sauce.usersLiked.includes(req.body.userId)) {
                        //Mise à jour de la sauce dans la BDD avec 1 like en moins, et suppression de l'utilisateur du tableau des utilisateurs ayant liké
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: req.body.userId },
                            }
                        )
                            .then(() => res.status(200).json({message: 'Like canceled!'}))
                            .catch(error => res.status(400).json({error}))
                    //Cas d'un dislike existant
                    } else if (sauce.usersDisliked.includes(req.body.userId)) {
                        //Mise à jour de la sauce dans la BDD avec 1 dislike en moins, et suppression de l'utilisateur du tableau des utilisateurs ayant disliké
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: req.body.userId },
                            }
                        )
                            .then(() => res.status(200).json({message: 'Dislike canceled!'}))
                            .catch(error => res.status(400).json({error}))
                    }
                })
                .catch(error => res.status(404).json({error}));

            break;
        case 1 :
            //Accès à la sauce avec l'id contenu dans les paramètres de la requête
            Sauce.findOne({_id: req.params.id})
                .then( sauce => {
                    //Vérification de l'existence d'un like ou dislike
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        res.status(208).json({error : "Sauce already liked"})
                    } else if (sauce.usersDisliked.includes(req.body.userId)) {
                        res.status(208).json({error : "Sauce cannot be liked and disliked at the same time"})
                    } else {
                        //Mise à jour du nombre de dislikes et du tableau des utilisateurs ayant liké
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: {likes: 1},
                                $push: {usersLiked: req.body.userId},
                            }
                        )
                            .then(() => res.status(200).json({message: 'Like added!'}))
                            .catch(error => res.status(400).json({error}))
                    }
                })
                .catch(error => res.status(404).json({error}))
            break;
    }
}