const Sauce = require('../models/sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save()
    .then(() => res.status(201).json({message: `Sauce ${sauceObject.name} créée`}))
    .catch(error => res.status(400).json({ error }));
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
    const sauceObject = req.file ?
    {  
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: `Sauce ${sauceObject.name} modifiée` }))
    .catch(error => res.status(400).json({ error }));

}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(sauce => res.status(200).json(sauce))
            .catch(error => res.status(404).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
}

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        if (req.body.like === 1) {
            const likesCount = sauce.usersLiked.length
            Sauce.updateOne({ _id: req.params.id }, { likes: likesCount })
            .then(() => res.status(200).json({ message: `Avis ajouté` }))
            .catch(error => res.status(400).json({ error }));
        }
        
    })
    .catch(error => res.status(500).json({ error }));


    /*
    Sauce.updateOne({ _id: req.params.id }, { $push: { usersLiked: req.body.userId } })
    .then(() => res.status(200).json({ message: `Avis ajouté` }))
    .catch(error => res.status(400).json({ error }));

*/

/*
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        console.log(likeObject)
        
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(sauce => res.status(200).json(sauce))
            .catch(error => res.status(404).json({ error })); 
        }); 
    })
    .catch(error => res.status(500).json({ error }));
    */
}