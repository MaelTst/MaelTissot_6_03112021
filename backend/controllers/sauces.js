const Sauce = require('../models/sauces');
const fs = require('fs');

// Controlleur pour la route POST /api/sauces/ - Création d'une sauce
// Remplace la valeur du champs userId de la requête par l'userId récupéré lors du decodage du token par le middleware d'authentification
// Créer un nouvel objet Sauce utilisant les informations renseignées par l'utilisateur et l'enregistre dans la base de données
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    sauceObject.userId = req.token.userId;
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
        .catch(error => res.status(400).json({ error }));
}

// Controlleur pour la route GET /api/sauces/ - Affichage de toutes les sauces
exports.getAll = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

// Controlleur pour la route GET /api/sauces/:id - Affichage d'une sauce
exports.getOne = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
}

// Controlleur pour la route PUT /api/sauces/:id - Modification d'une sauce
// Récupère les informations de la sauce correspondante au paramètre id de la requête
// Vérifie que l'userId de la sauce correspond à celui récupéré lors du decodage du token par le middleware d'authentification
// Créer un nouvel objet Sauce afin de pouvoir vérifier la validité des entrées par rapport au schéma Sauce (ex. heat: 0 à 10)
// Si la nouvelle sauce passe la validation du schéma, met à jour les informations de la base de données 
exports.updateSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === req.token.userId) {
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
                let validationFailed = sauceObject.validateSync();
                if (validationFailed) { return res.status(400).json({ error: validationFailed.message }) }
                Sauce.updateOne({ _id: req.params.id }, sauceObject)
                    .then(() => res.status(200).json({ message: `Sauce ${sauceObject.name} modifiée` }))
                    .catch(error => res.status(400).json({ error }));
            } else {
                res.status(401).json({ error: `Vous n'êtes pas autorisé à modifier cette sauce` })
            }
        })
        .catch(error => res.status(400).json({ error }));
}

// Controlleur pour la route DELETE /api/sauces/:id - Suppression d'une sauce
// Récupère les informations de la sauce correspondante au paramètre id de la requête
// Vérifie que l'userId de la sauce correspond à celui récupéré lors du decodage du token par le middleware d'authentification
// Récupère le nom du fichier de la sauce et le supprime à l'aide de la function unlink du module File System
// Supprime la sauce de la base de données
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId === req.token.userId) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`img/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: `La sauce a été supprimée` }))
                        .catch(error => res.status(404).json({ error }));
                });
            } else {
                res.status(401).json({ error: "Vous n'êtes pas autorisé à supprimer cette sauce" })
            }
        })
        .catch(error => res.status(500).json({ error }));
}

// Controlleur pour la route POST /api/sauces/:id/like - Like/Dislike d'une sauce
// Récupère les informations de la sauce correspondante au paramètre id de la requête
// Initialise des flags liked/disliked afin de déterminer si l'utilisateur a déjà liké/disliké la sauce
// Gère les trois cas possibles (1,0,-1) via une instruction switch en fonction des flags préalablement créés
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
                    break;
            }
        })
        .catch(error => res.status(500).json({ error }));
}