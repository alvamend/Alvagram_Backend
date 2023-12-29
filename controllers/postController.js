const { default: mongoose } = require('mongoose');
const PostSchema = require('../models/Post');
const User = require('../controllers/userController');
const Like = require('../models/Like');
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
        let { id } = req.params;
        if (id.length !== 24) return res.sendStatus(404);

        id = new mongoose.Types.ObjectId(id);
        const postFound = await PostSchema.aggregate([
            {
                $match: { '_id': id }
            }, {
                $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'UserWhoPosted' }
            }, {
                $unwind: '$UserWhoPosted'
            }, {
                $lookup: { from: 'comments', localField: '_id', foreignField: 'postId', as: 'Comments' }
            }, {
                $lookup: { from: 'likes', localField: '_id', foreignField: 'PostLiked', as: 'AllLikes' }
            }, {
                $addFields: {
                    Post: {date: '$date', image: '$image', description: '$description', likes: '$likes'}
                }
            },{
                $project: { "UserWhoPosted.password": 0, "UserWhoPosted.role": 0, 'AllLikes._id': 0, 'AllLikes.PostLiked': 0, 'user':0 }
            }
        ])
        if (!postFound) {
            return res.status(404).json({ message: `Post not found` });
        } else {
            return res.status(200).json({ post: postFound[0] })
        }
    } catch (err) {
        console.error(err)
    }
}

const createPost = async (req, res) => {

    if (req.file) {
        const file = req.file.originalname;
        const splitFile = file.split('\.');
        const extension = splitFile[1];

        if (extension != "png" && extension != "jpg" &&
            extension != "jpeg" && extension != "gif") {
            fs.unlink(req.file.path, error => {
                return res.status(403).json({ message: 'Invalid file extension' })
            });
        } else {
            try {
                const postToCreate = await PostSchema.create({
                    user: req.user.sub,
                    image: req.file.filename
                })

                if (!postToCreate) {
                    return res.status(503).json({ message: `Could not create Post` })
                } else {
                    return res.status(200).json({
                        message: `Post created successfully`,
                        postId: postToCreate._id,
                        filename: postToCreate.image
                    })
                }
            } catch (err) {
                console.error(err);
            }
        }

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
            console.log(postFound.image);
            fs.unlink(`./uploads/${postFound.image}`, error => {
                res.status(200).json({
                    message: `Post deleted successfully`
                })
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
                $lookup: { from: 'users', foreignField: '_id', localField: 'userFollowed', as: 'UserWhoPosted' }
            }, {
                $unwind: "$UserWhoPosted"
            }, {
                $lookup: { from: 'likes', foreignField: 'PostLiked', localField: 'Post._id', as: 'AllLikes' }
            }, {
                $lookup: { from: 'comments', foreignField: 'postId', localField: 'Post._id', as: 'Comments' }
            }, {
                $project: { "UserWhoPosted.password": 0, "UserWhoPosted.role": 0, "userFollowed": 0, "date": 0, "userFollowing": 0, "Post.user": 0, 'AllLikes._id': 0, 'AllLikes.PostLiked': 0 }
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

const updatePost = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    if (id.length !== 24) return res.sendStatus(404);
    try {

        const postToUpdate = await PostSchema.findOneAndUpdate({ _id: id }, {
            description: description
        })
        if (!postToUpdate) {
            return res.sendStatus(503);
        } else {
            return res.status(200).json({ message: `Post created/updated successfully` })
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
    getPostsUsersIFollow,
    updatePost
}