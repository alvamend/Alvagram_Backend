const { default: mongoose } = require("mongoose");
const Notifications = require("../models/Notifications")


const retrieveNotifications = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.user.sub);
    const notifications = await Notifications.aggregate([
        {
            $lookup: {from: 'users', localField: 'user', foreignField: '_id', as: 'User'}
        },{
            $unwind: '$User'
        },{
            $lookup: {from: 'posts', localField: 'postId', foreignField: '_id', as: 'Post'}
        },{
            $unwind: '$Post'
        },{
            $match: {'Post.user':id}
        },{
            $project: {'user':0, 'postId':0, 'User.password':0, 'User.role':0}
        }
    ])

    return res.status(200).json({notifications:notifications})
};

module.exports = {
    retrieveNotifications
}