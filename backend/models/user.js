const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Définition du schéma servant de modèle pour les Users
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Utilisation du Plugin mongoose-unique-validator afin de vérifier que l'email n'existe pas déjà dans la base de données
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);