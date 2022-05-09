const Sauce = require("../models/Sauce");
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'A new sauce had been created!'}))
        .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId !== req.auth.userId) {
                return res.status(403).json({
                    error: new Error('Unauthorized request')
                });
            }
            Sauce.updateOne({_id: req.params.id }, {...sauceObject, _id: req.params.id})
                .then(() => res.status(201).json({message: 'Sauce updated successfully!'}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(404).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.findOne({_id: req.params.id})
                    .then((sauce) => {
                        if (!sauce) {
                            return res.status(404).json({
                                error: new Error('Sauce not found')
                            });
                        }
                        if (sauce.userId !== req.auth.userId) {
                            return res.status(401).json({
                                error: new Error('Request forbidden')
                            });
                        }

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

exports.likeSauce = (req, res, next) => {
    switch (req.body.like) {
        case -1 :
            Sauce.updateOne(
                {_id: req.params.id},
                {
                    $inc: { dislikes: 1 },
                    $push: { usersDisliked: req.body.userId },
                    _id: req.params.id}
            )
                .then(() => res.status(200).json({message: 'Dislike added!'}))
                .catch(error => res.status(400).json({error}))
            break;
        case 0 :
            Sauce.findOne({_id: req.params.id})
                .then( sauce => {
                    if ( sauce.usersLiked.find(user => user === req.body.userId)) {
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: req.body.userId },
                                _id: req.params.id
                            }
                        )
                            .then(() => res.status(200).json({message: 'Like canceled!'}))
                            .catch(error => res.status(400).json({error}))
                    } else if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: req.body.userId },
                                _id: req.params.id
                            }
                        )
                            .then(() => res.status(200).json({message: 'Dislike canceled!'}))
                            .catch(error => res.status(400).json({error}))
                    }
                })
                .catch(error => res.status(404).json({error}));

            break;
        case 1 :
            Sauce.updateOne(
                {_id: req.params.id},
                {
                    $inc: { likes: 1 },
                    $push: { usersLiked: req.body.userId },
                    _id: req.params.id}
            )
                .then(() => res.status(200).json({message: 'Like added!'}))
                .catch(error => res.status(400).json({error}))
            break;
    }
}