const { default: mongoose } = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.DB_QUERY}`);
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    connectDB
}