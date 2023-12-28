const Comment = require('../models/Comment');
const Post = require('../models/Post');

const getAllComments = async (req, res) => {

}

const createComment = async (req, res) => {
    const { postId } = req.params;
    const { comment } = req.body;
    const { username } = req.user;
    if (postId.length !== 24) return res.sendStatus(404);

    console.log(postId, comment, username)

    try {
        const postExists = await Post.findOne({ _id: postId });
        if (!postExists) return res.sendStatus(404);

        const saveComment = await Comment.create({
            postId: postId,
            user: username,
            comments: comment
        })

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