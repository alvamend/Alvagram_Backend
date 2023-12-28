const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/verifyJWT');
const commentController = require('../controllers/commentController');

router.route('/:postId')
    // .get(checkAuth.verifyJWT, commentController.getAllComments)
    .post(checkAuth.verifyJWT, commentController.createComment)

module.exports = router;