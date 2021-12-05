const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const saucesRoutes = require('./routes/sauces')
const path = require('path');
const helmet = require("helmet");
require('dotenv').config();
const app = express();

// Connexion a la base de données MongoDB Atlas
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Attribution des headers aux réponses du serveur
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Parse le body des requetes entrantes et transforme le contenu JSON en objet JS
// Utilisation du middleware Helmet afin de renforcer la sécurité de l'application via l'ajout de plusieurs headers
// Indique à Express qu'il doit se servir du répertoire statique "img" lors des requêtes sur la route /images/
// Définition des routers à utiliser pour les routes /api/sauces et /api/auth
app.use(express.json());
app.use(helmet());
app.use('/images/', express.static(path.join(__dirname, 'img')));
app.use('/api/sauces', saucesRoutes)
app.use('/api/auth', userRoutes)

module.exports = app;

