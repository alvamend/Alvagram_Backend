require('dotenv').config();
const { connectDB } = require('./config/database');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/mainConfig');

const port = process.env.APP_PORT;
const app = express();

connectDB();

//IMPORT CORS OPTIONS LATER
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

/* Routes */
app.use('/', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/post', require('./routes/postRoutes'));
app.use('/follow', require('./routes/followRoutes'));
app.use('/like', require('./routes/likeRoutes'));

app.listen(port, () => {
    console.log(`App running in: http://localhost:${port}`);
})
