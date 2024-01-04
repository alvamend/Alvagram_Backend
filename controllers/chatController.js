const Chat = require('../models/Chat');

const getChats = async (username) => {
    try{
        const chats = await Chat.find({
            $or: [
                {fromUser: username},
                {toUser: username}
            ]
        });
        return chats;
    }catch(error){
        console.error(error)
    }
}

const createChat = async (msg) => {
    try{
        const chatExist = await Chat.findOne({fromUser: msg.fromUser, toUser: msg.toUser});
        if(!chatExist){
            const chatCreated = await Chat.create({
                fromUser: msg.fromUser,
                toUser: msg.toUser
            });
            return chatCreated;
        }else{
            return false;
        }
    }catch(error){
        console.error(error);
    }
}

const handleNewMessage = async(data, time) => {
    try {
        const chatExists = await Chat.findOne({_id:data.chatId});
        if(!chatExists){
            return false
        }else{
            chatExists.messages.push({
                from: data.from,
                to: data.to,
                message: data.message,
                time: time
            });
            await chatExists.save();
            return true
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    getChats,
    createChat,
    handleNewMessage
}