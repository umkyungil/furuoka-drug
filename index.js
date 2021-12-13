// CHAT TEST
const express = require('express')
const app = express();
const server = require('http').createServer(app);
const port = 7000;

app.use(express.static('public'));

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
})

const io = require('socket.io')(server, {
    log: false,
    pingInterval: 2500,
    pingTimeout: 6000
});

io.on('connection', (socket) => {
    socket.emit('message', {msg: 'Welcome ' + socket.id});

    //console.log("connection>>", socket.id, socket.handshake.query);

    socket.on('join', (roomId, fn) => {
        socket.join(roomId)
        if (fn) {
            fn(roomId);
        }       
    });

    socket.on('leave', (roomId, fn) => {
        socket.leave(roomId, () => {
            if (fn) {
                fn();
            }
        });
    });

    socket.on('rooms', (fn) => {
        if (fn) {
            fn(JSON.stringify([...socket.rooms]));
        }
    });

    // data: {room: 'roomid', msg: 'msg내용'}
    socket.on('message', (data, fn) => {
        console.log("message>>", data.msg, socket.rooms);
        if (fn) 
            fn(data.msg);

        socket.broadcast.to(data.room).emit('message', {room: data.room, msg: data.msg});
    });

    socket.on('message-for-one', (socketeid, msg,fn) => {
        socket.to(socketeid).emit('message', {msg: msg});
    });

    socket.on('disconnecting', (data) => {
        console.log("disconnecting>>", socket.id, socket.rooms);
    });

    socket.on('disconnecting', (data) => {
        console.log("disconnecting>>", socket.id, socket.rooms);
    });
});

server.listen(port, () => {
    console.log("Express started on port 7000");
});
