const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/verifyJWT');
const likeController = require('../controllers/likeController');

router.route('/:id')
    .get(checkAuth.verifyJWT, likeController.handleLike)

module.exports = router;