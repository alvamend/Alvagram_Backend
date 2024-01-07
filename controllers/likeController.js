const PostSchema = require('../models/Post');
const Notification = require('../models/Notifications');
const Like = require('../models/Like');

const handleLike = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) return res.sendStatus(404);

    try {
        const postFound = await PostSchema.findOne({ _id: id});
        if (!postFound) return res.sendStatus(404);

        //ASSIGN CURRENT NUMBER OF LIKES
        const currentLikes = postFound.likes;
        //LOOK FOR A POST LIKED BY THE CURRENT USER
        const findIfLiked = await Like.findOne({ userLiked: req.user.sub, PostLiked: id });
        if (findIfLiked) {

            await findIfLiked.deleteOne();
            await postFound.updateOne({ likes: currentLikes - 1 })
            return res.status(200).json({
                message: 'Disliked'
            })
        } else {
            const createLike = await Like.create({
                userLiked: req.user.sub,
                usernameLiked: req.user.username,
                PostLiked: postFound._id
            });

            const createNotification = await Notification.create({
                user: req.user.sub,
                typeNotification: 'Like',
                postId: postFound._id
            });

            if(!createLike) return res.sendStatus(503);

            await postFound.updateOne({likes: currentLikes + 1})
            return res.status(200).json({
                message: 'Liked'
            })
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    handleLike
}