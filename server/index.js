import express from 'express';
import bodyParser from 'body-parser';

import './common/mongoose';
import config from './common/config';

import './rabbitMQ/send';
import './rabbitMQ/receive';

const log = require('./common/log')(module);

// ****************** Import routes *************
import auth from './routes/auth';
import api from './routes/api';
import user from './routes/user';
import externals from './routes/externals';
//***********************************************
import Pair  from './models/pair';
import { getPowerPercentsFromUser } from "./common/functions/commonFunctions";

const dev = process.env.NODE_ENV === 'development';
const test = process.env.NODE_ENV === 'test';
const prod = process.env.NODE_ENV === 'production';

export const app = express();
export const server = require('http').Server(app);

const timeToSendSocketData = 5000;

    //******************************** Run server ***************************

    server.listen(config.PORT, () => console.log(`Server run on ${config.PORT} port`));

    // *******************************************************************


if(prod) {

    //************************* GARBAGE magic ***********************************

    // Для работы с garbage collector запустите проект с параметрами:
    // node --nouse-idle-notification --expose-gc app.js
    let gcInterval;

    function init() {
        gcInterval = setInterval(function () {
            gcDo();
        }, 60000);
    };

    function gcDo() {
        global.gc();
        clearInterval(gcInterval);
        init();
    };

    init();

    //************************************************************
}
    app.use(bodyParser.json());

    //******************************** Routes ***************************
    app.use('/auth', auth);
    app.use('/api', api);
    app.use('/user', user);
    app.use('/externals', externals);

//******************************** Uncaught Exception ***************************

process.on('uncaughtException', function (err) {
    log.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    log.error(err.stack);
    process.exit(1);
});

// Socket.IO
const io = require('socket.io')(server);

io.on('connection', socket => {
    let roomID;
    let socketInterval;
    socket.on('room', room => {
        roomID = room.id;
        socket.join(roomID);
        console.log('Join to ' + roomID + ' room');

        socketInterval = setInterval(() => {
           return Promise.all([
                getPowerPercentsFromUser(roomID)
                    .then(data => {
                        if(data) io.to(roomID).emit('launch_reached_percents', { data });
                    }),
                Pair.find({ owner: roomID }).then(pairs => Pair.populateByTitle(pairs.map(pair => pair._id)))
                    .then(pairs => {
                        io.to(roomID).emit('update-price', { pairs })
                    })
            ])
                .catch(err => console.log('Error in Socket intervals: ', err.message))
        }, timeToSendSocketData);
    });

    socket.on('logout', () => {
        console.log(`Logout ${roomID} room`);
        clearInterval(socketInterval);
        socketInterval = null;
        socket.leave(roomID);
    });

    socket.on('disconnect', () => {
        if(roomID) {
            console.log(`leave ${roomID} room`);
            clearInterval(socketInterval);
            socketInterval = null;
            socket.leave(roomID);
        };
    })
});






