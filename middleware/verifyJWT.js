require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyJWT = (req,res,next) => {

    const authHeader = req.headers['authorization'];
    if(!authHeader) return res.sendStatus(401);

    let token = authHeader.replace(/['"]+/g, '');

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (error, decode) => {
            if(error) return res.sendStatus(403);
            req.user = decode;
            next();
        }
    )

}

const socketIOVerifyJWT = (socket) => {
    if(socket.handshake.auth.token && socket.handshake.auth.token !== ''){
        let token = socket.handshake.auth.token.replace(/['"]+/g, '');

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (error, decode) => {
                if(error) return false;
                socket.username = decode.username;
            }
        )
        return true;
    }else{
        return false;
    }
}  

module.exports = {
    verifyJWT,
    socketIOVerifyJWT
}