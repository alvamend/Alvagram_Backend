const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/verifyJWT');
const followController = require('../controllers/followController');


router.route('/unfollow/:id')
    .get(checkAuth.verifyJWT, followController.handleUnfollow)
    
router.route('/')
    .post(checkAuth.verifyJWT, followController.handleFollow)


module.exports = router;