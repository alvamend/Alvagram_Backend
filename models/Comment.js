const { Schema, model } = require('mongoose');

const Comment = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
    },
    user: {
        type: String
    },
    comments: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
}, {
    versionKey: false,
    timestamps: false
});

module.exports = model('Comment', Comment)