const { Schema, model } = require('mongoose');

const Like = new Schema({
    userLiked: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    usernameLiked:{
        type: String
    },
    PostLiked: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    date: {
        type: Date,
        default: Date.now()
    }
}, {
    versionKey: false,
    timestamps: false
});

module.exports = model('Like', Like)