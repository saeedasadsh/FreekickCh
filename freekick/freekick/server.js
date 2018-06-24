var io = require('socket.io')(process.env.PORT || 3015);
var http = require('http');

console.log('server started');
var players = [];

var ShootingGame = [];
var FreekickGame = [];

ShootingGame[1] = { players: [] };
ShootingGame[2] = { players: [] };
ShootingGame[3] = { players: [] };
ShootingGame[4] = { players: [] };
ShootingGame[5] = { players: [] };
ShootingGame[6] = { players: [] };

FreekickGame[1] = { players: [] };
FreekickGame[2] = { players: [] };
FreekickGame[3] = { players: [] };
FreekickGame[4] = { players: [] };
FreekickGame[5] = { players: [] };
FreekickGame[6] = { players: [] };

io.on('connection', function (socket) {

    console.log('client coneccted');
    socket.emit('connectToServer', { res: "ok" });

    var id = -1;
    var level = -1;
    var partnerId = -1;
    var GameTier = -1;
    var GameType = "";

    socket.on("tellType", function (data) {
        try {
            id = data.id;
            level = data.level;
            var playerName = data.playerName;
            var seconds = new Date().getTime() / 1000;
            var dt = { id: id, playerName: playerName, mySocket: socket, Alive: seconds, level: level, plReady: 0 };

            players[id] = dt;
        }
        catch (e) {
            console.log("tellType: " + e.message);
        }
    });

    socket.on('checkAlive', function (data) {
        //console.log("checkAlive id: " + id);
        try {
            var seconds = new Date().getTime() / 1000;
            players[id].Alive = seconds;
            socket.emit("Alive", data);
        }
        catch (e) {
            console.log("checkAlive: " + e.message);
        }
    });

    socket.on('disconnectFromServer', function (data) {
        console.log("disconnectFromServer ");
    });

    socket.on('disconnect', function (data) {
        try {
            console.log("disconnected ");
            if (partnerId > 0 && typeof (players[partnerId]) != "undefined")
            {
                players[partnerId].mySocket.emit("winWithPartnerLeft", data);
            }

            delete players[id];
            if (GameTier > 0) {
                if (GameType == "sh") {
                    delete ShootingGame[GameTier].players[id];
                }
                else {
                    delete FreekickGame[GameTier].players[id];
                }
            }
        }
        catch (e) {
            console.log("disconnect: " + e.message);
        }
    });


    socket.on('getPlayersCount', function (data) {
        try {
            var dt = {
                sh1: ShootingGame[1].players.length, sh2: ShootingGame[2].players.length, sh3: ShootingGame[3].players.length, sh4: ShootingGame[4].players.length, sh5: ShootingGame[5].players.length, sh6: ShootingGame[6].players.length,
                fr1: FreekickGame[1].players.length, fr2: FreekickGame[2].players.length, fr3: FreekickGame[3].players.length, fr4: FreekickGame[4].players.length, fr5: FreekickGame[5].players.length, fr6: FreekickGame[6].players.length
            };
            //console.log(dt);
            socket.emit("playerCountResult", dt);
        }
        catch (e) {
            console.log("getPlayersCount: " + e.message);
        }
    });

    socket.on('ChooseGame', function (data) {
        try {
            // console.log(data);
            GameType = data.GameType;
            GameTier = data.GameTier;
            var pfk = data.fk;
            var pgk = data.gk;
            var ball = data.ball;
            var plpower = data.plpower;
            var playerVal = data.playerVal;

            var dt = { id: id, gameStarted: false, level: level, fk: pfk, gk: pgk, ball: ball, powers: plpower, playerVal: playerVal };


            if (GameType == "sh") {
                ShootingGame[GameTier].players[id] = dt;
                for (var pl in ShootingGame[GameTier].players) {
                    if (ShootingGame[GameTier].players[pl].level == level) {
                        //plReady = 0;
                        partnerId = ShootingGame[GameTier].players[pl].id;
                        var sdt = { partnerId: id, fk: pfk, gk: pgk, ball: ball, powers: plpower, playerVal: playerVal };
                        players[partnerId].mySocket.emit('startGame', sdt);

                        ShootingGame[GameTier].players.splice(id, 1);
                        ShootingGame[GameTier].players.splice(partnerId, 1);

                        players[partnerId].plReady = 0;
                        players[id].plReady = 0;
                        //var mdt = { partnerId: partnerId, fk: pfk, gk: pgk, ball: ball, powers: plpower, playerVal: playerVal };
                        var mdt = { partnerId: partnerId, fk: ShootingGame[GameTier].players[partnerId].fk, gk: ShootingGame[GameTier].players[partnerId].gk, ball: ShootingGame[GameTier].players[partnerId].ball, powers: ShootingGame[GameTier].players[partnerId].powers, playerVal: ShootingGame[GameTier].players[partnerId].playerVal };
                        socket.emit('startGame', mdt);
                        return;
                    }
                }

                var rdt = { result: "none" };
                socket.emit('tryLater', rdt);
            }
            else {
                console.log(id);
                FreekickGame[GameTier].players[id] = dt;

                for (var pl in FreekickGame[GameTier].players) {
                    if (typeof (FreekickGame[GameTier].players[pl]) != "undefined")
                        if ((FreekickGame[GameTier].players[pl].level < level + 1 || FreekickGame[GameTier].players[pl].level > level - 1) && FreekickGame[GameTier].players[pl].id != id) {
                            partnerId = FreekickGame[GameTier].players[pl].id;

                            players[partnerId].plReady = 0;
                            players[id].plReady = 0;

                            var partnerGoalKeeper = false;
                            var meGoalKeeper = false;
                            var rnd = Math.random();
                            if (rnd > 0.5) {
                                partnerGoalKeeper = true;
                            }
                            else {
                                meGoalKeeper = true;
                            }

                            partnerGoalKeeper = true;
                            meGoalKeeper = false;


                            plReady = 0;

                            var sdt = { partnerId: id, isGk: partnerGoalKeeper, fk: pfk, gk: pgk, ball: ball, powers: plpower, playerVal: playerVal, plReady: 0 };
                            players[partnerId].mySocket.emit('startGame', sdt);

                            var mdt = { partnerId: partnerId, isGk: meGoalKeeper, fk: FreekickGame[GameTier].players[partnerId].fk, gk: FreekickGame[GameTier].players[partnerId].gk, ball: FreekickGame[GameTier].players[partnerId].ball, powers: FreekickGame[GameTier].players[partnerId].powers, playerVal: FreekickGame[GameTier].players[partnerId].playerVal, plReady: 0 };
                            socket.emit('startGame', mdt);

                            delete  FreekickGame[GameTier].players[id];
                            delete FreekickGame[GameTier].players[partnerId];

                            return;
                        }
                }

                var rdt = { result: "none" };
                socket.emit('tryLater', rdt);
            }
        }
        catch (e) {
            console.log("ChooseGame: " + e.message);
        }
    });

    socket.on('canStartGame', function (data) {
        try {
            console.log(players[id].plReady);
            //plReady++;
            players[data.partnerId].plReady++;
            players[id].plReady++;


            var res = { players: players[id].plReady };

            socket.emit("callCanStartGame", res);
            players[data.partnerId].mySocket.emit("callCanStartGame", res);
        }
        catch (e) {
            console.log("canStartGame: " + e.message);
        }
    });

    socket.on('CancelChoose', function (data) {
        try {
            //console.log("disconnected ");
            var GameTy = data.GameType;
            var GameTi = data.GameTier;

            var dt = { id: id, gameStarted: false };

            if (GameTy == "sh") {
                delete ShootingGame[GameTi].players[id];
            }
            else {
                delete FreekickGame[GameTi].players[id];
            }

            GameType = "";
            GameTier = -1;
            partnerId = -1;
        }
        catch (e) {
            console.log("CancelChoose: " + e.message);
        }
    });

    socket.on('playerShootsBall', function (data) {
        try {
            //console.log(data);
            if (typeof (players[data.partnerId]) != "undefined") {
                players[data.partnerId].mySocket.emit("playerShootsBall", data);
            }
            else {

                socket.emit("winWithPartnerLeft", data);
            }
        }
        catch (e) {
            console.log("playerShootsBall: " + e.message);
            socket.emit("winWithPartnerLeft", data);
        }
    });

    socket.on('goalKeeperEnd', function (data) {
        try {
            //console.log(data);
            if (typeof (players[data.partnerId]) != "undefined") {
                players[data.partnerId].mySocket.emit("goalKeeperEnd", data);
            }
            else {

                socket.emit("winWithPartnerLeft", data);
            }
        }
        catch (e) {
            console.log("goalKeeperEnd: " + e.message);
            socket.emit("winWithPartnerLeft", data);
        }
    });



    socket.on('endDast', function (data) {
        try {
            //console.log(data);
            if (typeof (players[data.partnerId]) != "undefined") {
                players[data.partnerId].mySocket.emit("EndDast", data);
                socket.emit("EndDast", data);
            }
            else {

                socket.emit("winWithPartnerLeft", data);
            }
        }
        catch (e) {
            console.log("endDast: " + e.message);
            socket.emit("winWithPartnerLeft", data);
        }
    });

    socket.on('partnerGetShootParameters', function (data) {
        //console.log(data);
        try {
            if (typeof (players[data.partnerId]) != "undefined") {
                players[data.partnerId].mySocket.emit("shootBall", data);
                socket.emit("shootBall", data);
            }
            else {

                socket.emit("winWithPartnerLeft", data);
            }
        }
        catch (e) {
            console.log("partnerGetShootParameters: " + e.message);
            socket.emit("winWithPartnerLeft", data);
        }
    });

    socket.on('SendingGkData', function (data) {
        //console.log(data);
        try {
            if (typeof (players[data.partnerId]) != "undefined") {
                players[data.partnerId].mySocket.emit("recieveGkData", data);
            }
            else {

                socket.emit("winWithPartnerLeft", data);
            }
        }
        catch (e) {
            console.log("SendingGkData: " + e.message);
            socket.emit("winWithPartnerLeft", data);
        }
    });

    socket.on('getSendedGkData', function (data) {
        try {
            if (typeof (players[data.partnerId]) != "undefined") {
                //console.log(data);
                players[data.partnerId].mySocket.emit("getSendedGkData", data);
            }
            else {

                socket.emit("winWithPartnerLeft", data);
            }
        }
        catch (e) {
            console.log("getSendedGkData: " + e.message);
            socket.emit("winWithPartnerLeft", data);
        }
    });

    socket.on('sendEmoji', function (data) {
        try {
            if (typeof (players[data.partnerId]) != "undefined") {
                //console.log(data);
                players[data.partnerId].mySocket.emit("getEmoji", data);
            }
            else {
            }
        }
        catch (e) {
            console.log("sendEmoji: " + e.message);
        }
    });

});

(function () {

    try {
        var timeout = setInterval(function () {
            for (i = 1; i < 7; i++) {
                for (var pl in FreekickGame[i].players) {
                    if (typeof (FreekickGame[i].players[pl]) == "undefined") {
                        delete FreekickGame[i].players[pl];
                    }
                }
            }

            for (i = 1; i < 7; i++) {
                for (var pl in ShootingGame[i].players) {
                    if (typeof (ShootingGame[i].players[pl]) == "undefined") {
                        delete ShootingGame[i].players[pl];
                    }
                }
            }

            for (var pl in players) {
                if (typeof (players[pl]) == "undefined") {
                    delete players[pl];
                }
            }

        }, 5000);
    }
    catch (e) {
        console.log("2: " + e.message);
    }
})();

