const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const createValidator = require('../helpers/validators/userCreateValidator');
const updateValidator = require('../helpers/validators/userUpdateValidator');
const { verifyJWT } = require('../middleware/verifyJWT');

router.route('/')
    .get(userController.getAllUsers)
    .post(createValidator, userController.createUser);

router.route('/:id')
    .get(userController.getUserById)
    .put(updateValidator, userController.updateUserInfo)
    .delete(userController.removeUser);

module.exports = router;

