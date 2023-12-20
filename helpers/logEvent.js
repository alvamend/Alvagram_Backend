const fs = require('fs');
const fsPromises = require('fs').promises;
const { v4: uuid } = require('uuid');
const path = require('path');
const { format } = require('date-fns');

const logEvent = async (req, message) => {

    const dateTime = format(new Date(), 'Y-M-dd\tHH:mm:ss');
    const currentDate = format(new Date(), 'YMdd');
    const msg = `${dateTime}\t${uuid()}\t${req.method}\t${req.url}\t${message}\n`

    if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
        await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        await fsPromises.writeFile(path.join(__dirname, '..', 'logs', `${currentDate}`), msg);
    }else{
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', `${currentDate}`), msg);
    }
    
}

module.exports = {
    logEvent
}