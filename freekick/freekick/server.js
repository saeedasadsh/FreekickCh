var io = require('socket.io')(process.env.PORT || 3015);
var http = require('http');
console.log('server started');
// Supports multiple client chat application

// Keep a pool of sockets ready for everyone
// Avoid dead sockets by responding to the 'end' event
var players = [];

(function () {

    try {
        //var c = 0;
        var timeout = setInterval(function () {

            testRec();

        }, 10000);
    }
    catch (e) {
        console.log("2: " + e.message);
    }
})();



function testRec() {
    console.log("hi")
    for (var i = 0; i < players.length; i++)
    {

        players[i].write("hi");
    }
}

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

    socket.on('disconnectFromServer', function (data) {
        console.log("disconnectFromServer id: " + data.id)
    });

    socket.on('disconnect', function (data) {
        console.log("disconnected id: " + data.id)
    });

});