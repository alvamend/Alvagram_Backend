const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const checkAuth = require('../middleware/verifyJWT');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
    filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});

const handleMultiPartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 }
}).single('file0');


router.route('/')
    .get(checkAuth.verifyJWT, postController.getAllPosts)
    .post([checkAuth.verifyJWT, handleMultiPartData], postController.createPost)

router.route('/followed')
    .get(checkAuth.verifyJWT, postController.getPostsUsersIFollow)

router.route('/image/:filename')
    .get(postController.sendImage)

router.route('/:id')
    .get(checkAuth.verifyJWT, postController.getPostById)
    .delete(checkAuth.verifyJWT, postController.removePost)




module.exports = router;