const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const validation = require('../middleware/validation');
const rateLimit = require('../middleware/rate-limit');

// Router indiquant les middlewares et controllers à utiliser pour les differents endpoints de la route /auth
router.post('/signup', validation.signup, userCtrl.signup);
router.post('/login', rateLimit, userCtrl.login);
module.exports = router;