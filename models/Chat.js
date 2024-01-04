const { Schema, model } = require('mongoose');

const Chat = new Schema({
    fromUser: {
        type: String,
        required: true
    },
    toUser: {
        type: String,
        required: true
    },
    messages: [{
        from: {
            type: String
        },
        to: {
            type: String
        },
        message: {
            type: String
        },
        time: {
            type: Date
        }
    }]
}, {
    versionKey: false,
    timestamps: true
});

module.exports = model('Chat', Chat)