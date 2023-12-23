const { default: mongoose } = require('mongoose');
const PostSchema = require('../models/Post');
const User = require('../controllers/userController');
const Follow = require('../models/Follows');
const fs = require('fs');
const path = require('path');

const getAllPosts = async (req, res) => {
    const posts = await PostSchema.find();
    res.json({
        posts
    })
}

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        if (id.length !== 24) return res.sendStatus(404);

        const postFound = await PostSchema.findOne({ _id: id });
        if (!postFound) {
            return res.status(404).json({ message: `Post not found` });
        } else {
            return res.status(200).json({ post: postFound })
        }
    } catch (err) {
        console.error(err)
    }
}

const createPost = async (req, res) => {

    const file = req.file.originalname;
    const splitFile = file.split('\.');
    const extension = splitFile[1];

    const description = req.body.description;

    if (!description || description == '' || description === undefined) {
        fs.unlink(req.file.path, error => {
            console.log(`Could not save file`)
        });
    }

    if (extension != "png" && extension != "jpg" &&
        extension != "jpeg" && extension != "gif") {
        fs.unlink(req.file.path, error => {
            return res.status(403).json({ message: 'Invalid file extension' })
        });
    }

    try {

        if (!description || description == '' || description === undefined) return res.status(403).json({ message: 'Invalid description' })

        const postToCreate = await PostSchema.create({
            user: req.user.sub,
            description: description,
            image: req.file.filename
        })

        if (!postToCreate) return res.status(503).json({ message: `Could not create Post` })

        return res.status(200).json({ message: `Post created successfully` })

    } catch (err) {
        console.error(err);
    }

}

const sendImage = async (req, res) => {
    const { filename } = req.params;
    const localRoute = './uploads/' + filename;

    fs.stat(localRoute, (error, exists) => {
        if (exists) {
            return res.sendFile(path.resolve(localRoute));
        } else {
            return res.status(404).json({
                localRoute,
                filename,
            })
        }
    })
}

const removePost = async (req, res) => {

    const { id } = req.params;
    if (id.length !== 24) return res.sendStatus(404)
    try {
        const postFound = await PostSchema.findOneAndDelete({ _id: id, user: req.user.sub });
        if (!postFound) {
            res.status(403).json({
                message: `Could not delete Post`
            })
        } else {
            res.status(200).json({
                message: `Post deleted successfully`
            })
        }

    } catch (err) {
        console.error(err)
    }

}

const getPostsUsersIFollow = async (req, res) => {

    const userFollowing = new mongoose.Types.ObjectId(req.user.sub);

    try {
        const postsUsersIfollow = await Follow.aggregate([
            {
                $match: { 'userFollowing': userFollowing }
            }, {
                $lookup: { from: 'posts', foreignField: 'user', localField: 'userFollowed', as: 'Post' }
            }, {
                $unwind: '$Post'
            }, {
                $sort: { 'Post.date': -1 }
            }, {
                $lookup: { from: 'users', foreignField: '_id', localField: 'userFollowed', as: 'FollowedUser' }
            }, {
                $unwind: "$FollowedUser"
            },
            {
                $project: { "FollowedUser.password": 0, "FollowedUser.role": 0, "userFollowed": 0, "date": 0, "userFollowing": 0, "Post.user": 0 }
            }
        ])
        if (postsUsersIfollow) {
            return res.status(200).json({
                postsUsers: postsUsersIfollow
            })
        }
    } catch (error) {
        console.error(error);
    }


}

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    sendImage,
    removePost,
    getPostsUsersIFollow
}