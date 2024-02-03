const { default: mongoose } = require("mongoose");
const Notifications = require("../models/Notifications")


const retrieveNotifications = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.user.sub);
    const notifications = await Notifications.aggregate([
        {
            $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' }
        }, {
            $unwind: '$userInfo'
        }, {
            $lookup: { from: 'posts', localField: 'postId', foreignField: '_id', as: 'postInfo' }
        }, {
            $unwind: '$postInfo'
        }, {
            $match: { 'postInfo.user': id }
        }, {
            $sort: { 'date': -1 }
        }, {
            $project: { 'user': 0, 'postId': 0, 'userInfo.password': 0, 'userInfo.role': 0 }
        }
    ])

    return res.status(200).json({ notifications: notifications })
};

const retrieveNotificationByCategory = async (req, res) => {
    const id = new mongoose.Types.ObjectId(req.user.sub);
    const param = req.params.category;
    const category = param.substr(0, 1).toUpperCase() + param.substr(1, param.length - 1);

    const notifications = await Notifications.aggregate([
        {
            $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' }
        }, {
            $unwind: '$userInfo'
        }, {
            $lookup: { from: 'posts', localField: 'postId', foreignField: '_id', as: 'postInfo' }
        }, {
            $unwind: '$postInfo'
        }, {
            $match: { 'postInfo.user': id, 'typeNotification': category }
        }, {
            $project: {
                'user': 0,
                'postId': 0,
                'userInfo.password': 0,
                'userInfo.role': 0
            }
        }
    ]);
    return res.status(200).json({
        notifications
    });
}

module.exports = {
    retrieveNotifications,
    retrieveNotificationByCategory
}