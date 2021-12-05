// Middleware de validation pour le endpoint /api/auth/signup
// Vérifie que les entrées mail et password de l'utilisateur respectent les contraintes imposées par les RegEx suivantes :
// mailValidation : [*] + [@] + [*] +[.] + [*]
// passwordValidation : un chiffre, une minuscule, une majuscule et 8 caractères minimum
exports.signup = (req, res, next) => {
    const passwordValidation = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
    const mailValidation = new RegExp(/\S+@\S+\.\S+/);
    let validationMsg = "";
    if (!mailValidation.test(req.body.email) || !passwordValidation.test(req.body.password)) {
        if (!mailValidation.test(req.body.email)) {
            validationMsg += "Adresse email invalide !\n";
        }
        if (!passwordValidation.test(req.body.password)) {
            validationMsg += "Mot de passe invalide ! (Doit contenir au moins 8 caractères, une lettre, un chiffre, une majuscule et une minuscule";
        }
        res.status(400).json({ message: validationMsg });
    }
    else {
        next();
    }
};