const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { logEvent } = require('../helpers/logEvent');
const { default: mongoose } = require('mongoose');

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

    try {
        const userToRemove = await User.findOneAndDelete({ _id: id });
        if (userToRemove) {
            await logEvent(req, `User ${userToRemove.username} deleted by ${req.user}`);
            return res.status(200).json({ message: `User removed succesfully` });
        } else {
            return res.status(404).json({ message: `User not found` });
        }
    } catch (err) {
        console.error(err);
    }
}

// THIS IS ONLY TO RETRIEVE OWN USER PROFILE UNDER MY PROFILE SECTION IN THE FRONTEND
const retrieveProfile = async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.sub);
    try {
        const profileInfo = await User.aggregate([
            {
                $match: { "_id": userId }
            }, {
                $lookup: { from: 'posts', localField: '_id', foreignField: 'user', as: 'Posts' }
            }, {
                $addFields: {
                    User: { name: "$name", surname: "$surname", username: "$username", image: "$image" }
                }
            }, {
                $project: { "password": 0, "role": 0, "name": 0, "surname": 0, "username": 0, "image": 0 }
            }
        ]);

        if (profileInfo) {
            return res.status(200).json({
                profile: profileInfo[0]
            })
        }
    } catch (error) {
        console.error(error);
    }
}

const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const profileInfo = await User.aggregate([
            {
                $match: { "username": username }
            }, {
                $lookup: { from: 'posts', localField: '_id', foreignField: 'user', as: 'Posts' }
            }, {
                $sort: { "Posts.date": -1 }
            }, {
                $lookup: { from: 'follows', localField: '_id', foreignField: 'userFollowed', as: 'Followers' }
            }, {
                $lookup: { from: 'users', localField: 'Followers.userFollowing', foreignField: '_id', as: 'FollowersInfo' }
            }, {
                $lookup: {from: 'follows', localField: '_id', foreignField: 'userFollowing', as: 'Following'}
            },{
                $lookup: { from: 'users', localField: 'Following.userFollowed', foreignField: '_id', as: 'FollowingInfo'}
            },{
                $addFields: {
                    User: { name: "$name", surname: "$surname", username: "$username", image: "$image", id: "$_id" }
                }
            }, {
                $project: { "password": 0, "role": 0, "name": 0, "surname": 0, "username": 0, "image": 0, "Followers": 0, "FollowersInfo._id": 0, "FollowersInfo.image": 0, "FollowersInfo.password": 0, "FollowersInfo.role": 0, "Following": 0, "FollowingInfo._id": 0, "FollowingInfo.image": 0, "FollowingInfo.password": 0, "FollowingInfo.role": 0 }
            }
        ]);

        if (profileInfo.length > 0) {
            return res.status(200).json({
                profile: profileInfo[0]
            })
        } else {
            return res.sendStatus(404)
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUserInfo,
    removeUser,
    retrieveProfile,
    getUserByUsername
}