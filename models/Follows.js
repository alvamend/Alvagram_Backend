const { Schema, model } = require('mongoose');

const Follow = new Schema({
    userFollowing: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    userFollowed: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now()
    }
}, {
    versionKey: false,
    timestamps: false
});

module.exports = model('Follow', Follow)