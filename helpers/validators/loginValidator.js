const { body } = require('express-validator');

const loginValidator = [
    body('username', 'Invalid username').not().isEmpty(),
    body('password', 'Invalid password').not().isEmpty(),
]

module.exports = loginValidator;