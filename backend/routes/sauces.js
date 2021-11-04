const express = require('express');
const router = express.Router();
const saucesCtrl = require('../controllers/sauces');
const multer = require('../middleware/multer-config');

router.post('/', multer, saucesCtrl.createSauce);
router.get('/', saucesCtrl.getAll);
router.get('/:id', saucesCtrl.getOne); 
router.put('/:id', saucesCtrl.updateSauce);
router.delete('/:id', saucesCtrl.deleteSauce);
router.post('/:id/like', saucesCtrl.likeSauce);
module.exports = router;