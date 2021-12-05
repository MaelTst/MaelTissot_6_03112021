const jwt = require('jsonwebtoken');

// Middleware d'authentification présent sur chaque endpoints de la route /sauces
// Récupère et vérifie le token d'authentification du header Authorization des rêquetes entrantes
// Vérifie que l'userId du body de la requête correspond bien à l'userId encodé dans le token avant d'appeler next()
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        req.token = jwt.verify(token, process.env.JWT);
        const userId = req.token.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable';
        }
        else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: "Requete non authentifiée !" });
    }
};