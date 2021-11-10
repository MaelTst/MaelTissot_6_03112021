const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        req.token = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = req.token.userId;
        if (req.body.userId && req.body.userId !== userId) { // <=== temp
            throw 'User ID non valable'; } 
        else {
            next();
        }
    } catch (error) {
        res.status(401).json({error: "Requete non authentifiée !"});
    }
};