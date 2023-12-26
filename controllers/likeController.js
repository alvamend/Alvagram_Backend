const PostSchema = require('../models/Post');
const Like = require('../models/Like');

const handleLike = async (req, res) => {
    const { id } = req.params;
    if (id.length !== 24) return res.sendStatus(404);

    console.log(`id: ${id}`)

    try {
        const postFound = await PostSchema.findOne({ _id: id});
        if (!postFound) return res.sendStatus(404);

        console.log(`Post found:\n ${postFound}`)
        //ASSIGN CURRENT NUMBER OF LIKES
        const currentLikes = postFound.likes;
        console.log(`Current likes: ${currentLikes}`)
        //LOOK FOR A POST LIKED BY THE CURRENT USER
        const findIfLiked = await Like.findOne({ userLiked: req.user.sub, PostLiked: id });
        console.log(`User liked before:\n ${findIfLiked}`)
        if (findIfLiked) {

            await findIfLiked.deleteOne();
            await postFound.updateOne({ likes: currentLikes - 1 })
            console.log(`Current number of likes after dislike: ${postFound.likes} `)
            return res.status(200).json({
                message: 'Disliked'
            })
        } else {

            const createLike = await Like.create({
                userLiked: req.user.sub,
                usernameLiked: req.user.username,
                PostLiked: postFound._id
            });

            if(!createLike) return res.sendStatus(503);

            await postFound.updateOne({likes: currentLikes + 1})
            console.log(`Current number of likes after like: ${postFound.likes} `)
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