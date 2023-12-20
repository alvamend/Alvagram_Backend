require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyJWT = (req,res,next) => {

    const authHeader = req.headers['authorization'];
    if(!authHeader) return res.sendStatus(403);

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

module.exports = {
    verifyJWT
}