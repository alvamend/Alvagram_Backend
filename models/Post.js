const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    comments: [{
        userComment: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: {
            type: String
        },
        dateComment: {
            type: String
        }
    }],
    likes: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now()
    }

},{
    versionKey: false,
    timestamps: false
});

module.exports = model('Post', PostSchema)