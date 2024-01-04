// IMPORT CREATE SERVER AND SERVER
const checkToken = require('../middleware/verifyJWT');
const { Server } = require('socket.io');

const handleSocketFunctions = (server) => {


    // ADDING CORS TO WEB SOCKET IO
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
    });

    io.use((socket, next) => {
        const verifyToken = checkToken.socketIOVerifyJWT(socket);
        if (verifyToken) {
            next();
        }
    });

    io.on('connection', async (socket) => {

        const userController = require('../controllers/chatController');
        let users = [];

        console.log('USER CONNECTED')

        for (let [id, socket] of io.of("/").sockets) {
            users.push({
                sessionID: id,
                username: socket.username
            })
        };

        //BROADCAST TO ALL USERS
        socket.broadcast.emit('User Connected', {
            sessionID: socket.id,
            username: socket.username
        })

        //SENDS SESSION INFORMATION TO THE CLIENT, CURRENT USER
        socket.emit('Connected', {
            sessionID: socket.id,
            username: socket.username
        });

        //RECEIVES SIGNAL TO COLLECT ALL CHATS WHERE THE USER IS INVOLVED
        socket.on('Get Chats', async () => {
            const userChats = await userController.getChats(socket.username);
            //SENDS ALL THE CHATS WHERE THE USER IS PRESENT
            socket.emit('Fetched Chats', userChats);
        });
        
        //CREATES NEW CHAT, VERIFIES IF CHAT ALREADY EXISTS AND EMITS THE EVENT TO THE 2ND USER
        socket.on('New Chat', async data => {
            const chatController = require('../controllers/chatController');
            const chatCreated = await chatController.createChat(data);
        
            if(chatCreated !== false){
                io.sockets.sockets.forEach(socketDestination => {
                    if(socketDestination.username === chatCreated.toUser){
                        io.to(socketDestination.id).emit('Chat Created', chatCreated)
                    }
                })
                socket.emit('Chat Created', chatCreated);
            }
        })

        //SUBSCRIBES THE CURRENT SOCKET TO THE ROOM
        socket.on('Join Chat', data => {
            socket.join(data.chatId);
        })

        //HANDLES NEW MESSAGES AND SENDS THEM TO THE SPECIFIC ROOM
        socket.on('Send Message', async data => {
            const chatController = require('../controllers/chatController');
            try {
                const time = Date.now();
                const handleMessage = await chatController.handleNewMessage(data, time);
                if(handleMessage){
                    io.to(data.chatId).emit('Message Received', {
                        from: data.from,
                        user: data.to,
                        message: data.message,
                        time: time
                    });
                }
            } catch (error) {
                console.error(error);
            }          
        })
    })
}

module.exports = {
    handleSocketFunctions
}