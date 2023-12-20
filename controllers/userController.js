const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { logEvent } = require('../helpers/logEvent');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        if (users) return res.status(200).json({ users: users });

    } catch (err) {
        console.error(err)
    }
}

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (id.length !== 24) return res.sendStatus(404);

        const foundUser = await User.findById(id).select({ password: 0 });
        if (!foundUser) return res.status(404).json({ message: `User not found` });

        return res.status(200).json({ user: foundUser })
    } catch (err) {
        console.error(err);
    }
}

const createUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(503).json({ errors: errors.array() });

        const userAlreadyExists = await User.findOne({ username: req.body.username });
        if (userAlreadyExists) return res.status(403).json({ message: `User already exists` });

        req.body.password = bcrypt.hashSync(req.body.password, 10);
        const userCreated = await User.create(req.body);

        if (userCreated) {
            await logEvent(req, `User ${userCreated.username} created by ${req.user}`)
            return res.status(200).json({ message: `User created succesfully` });
        } else {
            return res.status(404).json({ message: `User not found` });
        }

    } catch (err) {
        console.error(err);
    }
}

const updateUserInfo = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) return res.sendStatus(404);

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(503).json({ errors: errors.array() });

    try {
        const updatedUser = await User.findOneAndUpdate({ _id: id }, req.body);

        if (updatedUser) {
            await logEvent(req, `User ${updatedUser.username} modified by ${req.user}`);
            return res.status(200).json({ message: `User updated succesfully` });
        } else {
            return res.status(404).json({ message: `User not found` });
        }

    } catch (error) {
        console.error(error);
    }
}

const removeUser = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) return res.sendStatus(404);

    try{
        const userToRemove = await User.findOneAndDelete({_id:id});
        if(userToRemove){
            await logEvent(req, `User ${userToRemove.username} deleted by ${req.user}`);
            return res.status(200).json({ message: `User removed succesfully` });
        }else{
            return res.status(404).json({ message: `User not found` });
        }
    }catch(err){
        console.error(err);
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUserInfo,
    removeUser
}