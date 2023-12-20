const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    image: {
        type: String,
        default: 'default.png'
    }
},{
    timestamps: false,
    versionKey: false
})

module.exports = model('User', UserSchema);