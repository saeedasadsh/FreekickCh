﻿var io = require('socket.io').listen(3015);

console.log("server started");

io.sockets.on('connection', function (socket) {
    io.sockets.emit('this', { will: 'be received by everyone' });

    socket.on('private message', function (msg) {
        console.log('New Chat Message ', msg);
        io.sockets.emit('txt', msg);
    });

    socket.on('disconnect', function () {
        io.sockets.emit('User Disconnected');
    });

    socket.on('newuser', function (name) {
        console.log(name, ' Is Now Connected!');
        io.sockets.emit('txt', name + ' is now online');
    });

    socket.on('exit', function (name) {
        console.log(name, ' Has Been Disconnected!');
        io.sockets.emit('txt', name + ' is now offline');
    });

});