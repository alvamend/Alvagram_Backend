const express = require('express');
const { verifyJWT } = require('../middleware/verifyJWT');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

router.route('/')
    .get(verifyJWT, notificationController.retrieveNotifications);

module.exports = router;