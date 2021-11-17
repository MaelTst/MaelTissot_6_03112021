const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const validation = require('../middleware/validation');

router.post('/signup', validation.signup, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;