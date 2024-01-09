const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notifications');

const getAllComments = async (req, res) => {

}

const createComment = async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const { username } = req.user;
    if (postId.length !== 24) return res.sendStatus(404);

    try {
        const postExists = await Post.findOne({ _id: postId });
        if (!postExists) return res.sendStatus(404);

        const saveComment = await Comment.create({
            postId: postId,
            user: username,
            comments: comment
        })

        const createNotification = await Notification.create({
            user: req.user.sub,
            typeNotification: 'Comment',
            postId: postExists._id
        });

        if(!saveComment){
            return res.sendStatus(503);
        }else{
            return res.sendStatus(200)
        };
    } catch (error) {
        console.error(error);
    }

}

module.exports = {
    getAllComments,
    createComment
}