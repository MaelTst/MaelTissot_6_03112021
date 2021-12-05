const rateLimit = require("express-rate-limit");
// Middleware empechant les tentatives de bruteForce en limitant le nombre de requetes à 5 toutes les 15 minutes. Utilisé sur la route /api/auth/login  
module.exports =
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5
    });