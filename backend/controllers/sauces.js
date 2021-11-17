const Sauce = require('../models/sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    sauceObject.userId = req.token.userId; // force l'userId du token pour empecher la création de sauce avec un Id différent de celui de l'user loggé
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save()
        .then(() => res.status(201).json({ message: `Sauce ${sauceObject.name} créée` }))
        .catch(error => res.status(400).json({ message: error }));
}


exports.getAll = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

exports.getOne = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}

exports.updateSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === req.token.userId) { // check si l'userId du token correspond à celui de la sauce
                const sauceObject = new Sauce(req.file ?
                    {
                        ...JSON.parse(req.body.sauce),
                        userId: sauce.userId,
                        likes: sauce.likes,
                        dislikes: sauce.dislikes,
                        usersLiked: sauce.usersLiked,
                        usersDisliked: sauce.usersDisliked,
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                        _id: sauce._id

                    } : {
                        ...req.body,
                        userId: sauce.userId,
                        likes: sauce.likes,
                        dislikes: sauce.dislikes,
                        usersLiked: sauce.usersLiked,
                        usersDisliked: sauce.usersDisliked,
                        imageUrl: sauce.imageUrl,
                        _id: sauce._id
                    });
                if (sauceObject.validateSync()) { return res.status(400).json({ error: `Requete incorrecte` }) }
                Sauce.updateOne({ _id: req.params.id }, sauceObject)
                    .then(() => res.status(200).json({ message: `Sauce ${sauceObject.name} modifiée` }))
                    .catch(error => res.status(400).json({ error }));
            } else {
                res.status(401).json({ error: `Vous n'êtes pas autorisé à modifier cette sauce` })
            }
        })
        .catch(error => res.status(400).json({ error }));
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === req.token.userId) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(sauce => res.status(200).json({ message: `La sauce a été supprimée` }))
                        .catch(error => res.status(404).json({ error }));
                });
            } else {
                res.status(401).json({ error: "Vous n'êtes pas autorisé à supprimer cette sauce" })
            }
        })
        .catch(error => res.status(500).json({ error: "Cette sauce n'existe pas" }));
}

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            let liked = sauce.usersLiked.find(id => id === req.token.userId)
            let disliked = sauce.usersDisliked.find(id => id === req.token.userId)
            switch (req.body.like) {
                case 1:
                    if (!liked && !disliked) {
                        Sauce.updateOne({ _id: sauce.id }, { $push: { usersLiked: req.token.userId }, $inc: { likes: 1 } })
                            .then(() => res.status(200).json({ message: `Avis ajouté` }))
                            .catch(error => res.status(400).json({ error }));
                    } else {
                        res.status(400).json({ error: "Vous avez déjà un avis actif pour cette sauce" })
                    }
                    break;
                case 0:
                    if (liked) {
                        Sauce.updateOne({ _id: sauce.id }, { $pull: { usersLiked: req.token.userId }, $inc: { likes: -1 } })
                            .then(() => res.status(200).json({ message: `Avis modifié` }))
                            .catch(error => res.status(400).json({ error }));
                    }
                    if (disliked) {
                        Sauce.updateOne({ _id: sauce.id }, { $pull: { usersDisliked: req.token.userId }, $inc: { dislikes: -1 } })
                            .then(() => res.status(200).json({ message: `Avis modifié` }))
                            .catch(error => res.status(400).json({ error }));
                    }
                    break;
                case -1:
                    if (!liked && !disliked) {
                        Sauce.updateOne({ _id: sauce.id }, { $push: { usersDisliked: req.token.userId }, $inc: { dislikes: 1 } })
                            .then(() => res.status(200).json({ message: `Avis ajouté` }))
                            .catch(error => res.status(400).json({ error }));
                    } else {
                        res.status(400).json({ error: "Vous avez déjà un avis actif pour cette sauce" })
                    }
                    break;
                default:
            }
        })
        .catch(error => res.status(500).json({ error }));
}