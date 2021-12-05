const multer = require('multer');

// Dictionnaire permettant de définir l'extension du fichier en fonction de son type MIME 
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration du Middleware Multer indiquant sous quel nom (filename) et dans quel dossier enregistrer les fichiers reçus (destination)
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'img');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image');