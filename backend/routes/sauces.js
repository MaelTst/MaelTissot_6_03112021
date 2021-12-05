const express = require('express');
const router = express.Router();
const saucesCtrl = require('../controllers/sauces');
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

// Router indiquant les middlewares et controllers à utiliser pour les differents endpoints de la route /sauces
router.post('/', auth, multer, saucesCtrl.createSauce);
router.get('/', auth, saucesCtrl.getAll);
router.get('/:id', auth, saucesCtrl.getOne);
router.put('/:id', auth, multer, saucesCtrl.updateSauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.post('/:id/like', auth, saucesCtrl.likeSauce);
module.exports = router;