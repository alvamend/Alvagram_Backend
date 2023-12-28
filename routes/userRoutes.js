const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const createValidator = require('../helpers/validators/userCreateValidator');
const updateValidator = require('../helpers/validators/userUpdateValidator');
const { verifyJWT } = require('../middleware/verifyJWT');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'profile_pics')),
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
    .get(userController.getAllUsers)
    .post(createValidator, userController.createUser);

router.route('/changepwd/:id')
    .post(verifyJWT, userController.changePassword)

router.route('/profile')
    .get(verifyJWT, userController.retrieveProfile)

router.route('/profile/:username')
    .get(verifyJWT, userController.getUserByUsername)

router.route('/image/upload')
    .post([verifyJWT, handleMultiPartData], userController.uploadProfilePic)

router.route('/image/download/:filename')
    .get(userController.sendImage)

router.route('/:id')
    .get(userController.getUserById)
    .put(updateValidator, userController.updateUserInfo)
    .delete(userController.removeUser);

module.exports = router;

