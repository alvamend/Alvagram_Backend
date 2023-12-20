const { body } = require('express-validator');

const userCreateValidator = [
    body('name', 'Invalid name').not().isEmpty().isLength({min: 2, max: 20}),
    body('surname', 'Invalid surname').not().isEmpty().isLength({min: 2, max: 20}),
    body('username', 'Invalid username').not().isEmpty(),
    body('password', 'Invalid password').not().isEmpty(),
    body('role', 'Invalid role').optional().not().isEmpty()
]

module.exports = userCreateValidator;