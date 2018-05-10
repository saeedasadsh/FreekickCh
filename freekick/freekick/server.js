var io = require('socket.io')(process.env.PORT || 3015);
var http = require('http');
console.log('server started');
// Supports multiple client chat application

// Keep a pool of sockets ready for everyone
// Avoid dead sockets by responding to the 'end' event
var players = [];

io.on('connection', function (socket) {

    console.log('client coneccted ');
    socket.emit("setYourId", "setYourId");

    socket.on("setPlayer", function (data) {
        var id = data.id;
        var playerName = data.playerName;
        var sock = socket;
        var userData = { id: id, playerName: playerName, MySocket: sock };
        players[id] = userData;
    });

    socket.on('disconnect', function (data) {
        console.log("disconnected id: " + data.id)
    });

});