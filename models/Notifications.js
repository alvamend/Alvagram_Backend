const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    typeNotification: {
        type: String,
        required: true
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    date: {
        type: Date,
        default: Date.now()
    }

},{
    versionKey: false,
    timestamps: false
});

module.exports = model('Notification', NotificationSchema)