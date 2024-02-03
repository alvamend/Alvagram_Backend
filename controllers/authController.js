require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { logEvent } = require('../helpers/logEvent');

const handleLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(503).json({ errors: errors.array() });

    try {

        const { username, password } = req.body;
        const foundUser = await User.findOne({ username: username });

        if (!foundUser) return res.status(404).json({ message: 'Invalid Username or Password' });

        const pwdMatches = await bcrypt.compare(password, foundUser.password);

        if (!pwdMatches) return res.status(404).json({ message: 'Invalid Username or Password' });

        //GENERATE AND RETURN PAYLOAD

        const payload = {
            sub: foundUser._id,
            name: foundUser.name,
            surname: foundUser.surname,
            username: foundUser.username,
            role: foundUser.role
        }

        const accessToken = jwt.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '30m' }); //CHANGE LATER
        const refreshToken = jwt.sign(payload, `${process.env.REFRESH_TOKEN_SECRET}`, { expiresIn: '1d' }); //CHANGE LATER

        await logEvent(req, `User ${foundUser.username} logged in`)
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.status(200).json({
            username: foundUser.username,
            role: foundUser.role,
            accessToken
        })

    } catch (err) {
        console.error(err);
    }

}

const handleRefreshToken = (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);

        const refreshToken = cookies.jwt;

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (error, decode) => {
                if (error) return res.sendStatus(403);

                const foundUser = await User.findOne({ username: decode.username });
                const payload = {
                    sub: foundUser._id,
                    name: foundUser.name,
                    surname: foundUser.surname,
                    username: foundUser.username,
                    role: foundUser.role
                }

                const newAccessToken = jwt.sign(
                    payload,
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '30m' }
                )

                return res.status(200).json({
                    username: foundUser.username,
                    role: foundUser.role,
                    accessToken: newAccessToken
                })
            }
        )

    } catch (error) {
        console.error(error);
    }
}

const handleLogout = (req, res) => {
    const cookies = req.cookies;
    if(!cookies.jwt) return res.sendStatus(204);

    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
    res.sendStatus(204);
}

module.exports = {
    handleLogin,
    handleRefreshToken,
    handleLogout
}