const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/verifyJWT');
const followController = require('../controllers/followController');

router.route('/')
    .post(checkAuth.verifyJWT, followController.handleFollow)


module.exports = router;