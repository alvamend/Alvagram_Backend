const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginValidator = require('../helpers/validators/loginValidator');

router.post('/login', loginValidator, authController.handleLogin);
router.get('/refresh', authController.handleRefreshToken);
router.get('/logout', authController.handleLogout);

module.exports = router;