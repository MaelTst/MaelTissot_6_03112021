const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Controlleur pour la route POST /api/auth/signup - Création d'un utilisateur
// Hash le mot de passe de l'utilisateur à l'aide du module bcrypt
// Créer un nouvel objet User utilisant les informations renseignées par l'utilisateur et l'enregistre dans la base de données
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
                .catch(error => res.status(400).json({ error }))
        })

        .catch(error => res.status(500).json({ error }))
};

// Controlleur pour la route POST /api/auth/login - Connexion d'un utilisateur
// Cherche les informations de l'utilisateur correspondant à l'adresse email de la requête
// Si un utilisateur est trouvé, compare le hash du mot de passe présent dans la base de données avec celui de la requête
// Si la comparaison est un succès, renvoit l'userId ainsi qu'un token d'authentification créé par le module jsonwebtoken, ayant pour Payload l'userId et valide pendant 24 heures
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: "Utilisateur non trouvé" });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: "Mot de passe incorrect" });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
};