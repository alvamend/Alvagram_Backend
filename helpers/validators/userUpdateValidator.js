const { body } = require('express-validator');

const userUpdateValidator = [
    body('name', 'Invalid name').optional().not().isEmpty(),
    body('surname', 'Invalid surname').optional().not().isEmpty(),
    body('password', 'Invalid password').optional().not().isEmpty(),
]

module.exports = userUpdateValidator;