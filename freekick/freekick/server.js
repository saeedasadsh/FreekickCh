var io = require('socket.io')(process.env.PORT || 3010);
var http = require('http');

console.log('server started');

var leagues = [];
var LeaguePlayerCount = [];
var LeaguePlayerCountMax = [];
var leaguesPlayersArr = [[]];
var leaguesPlayersNameArr = [[]];
var leaguesPlayersAvatarArr = [[]];
var leagueSocksArr = [[]];

var players = [];
var rooms = [];

rooms[0] = [];
rooms[1] = [];
rooms[2] = [];
rooms[3] = [];
rooms[4] = [];
rooms[5] = [];
rooms[6] = [];

(function () {
    var c = 0;
    var timeout = setInterval(function () {
        //do thing
        //GetLeagues();
        //
        console.log("hi");
    }, 30000);
})();

io.on('connection', function (socket) {

    console.log('client coneccted' );
    socket.emit('connectToServer', { result: "connected" });

    var id = -1;
    var mysocket = null;
    socket.on("setPlayer", function (data) {

        id = data.id;
        mysocket = socket;

        var userData = { id: data.id, myName: data.myName, socket: mysocket};

        console.log("connect To Server by id:" + data.id);

        if (id>0) {
            players[id] = userData;
            var sendData = { result:"ok",id: id};
            socket.emit("addedToServer", datal);
        }
    });

    socket.on('disconnect', function (data) {
        console.log("disconnected id: " + data.id)
        myid = thisClientId;

        for (i = 0; i < playersArr.length; i++) {
            for (j = 0; j < playersArr[i].length; j++) {
                if (playersArr[i][j] == myid) {
                    playersArr[i].splice(j, 1);
                    socksArr[i].splice(j, 1);
                    playersNameArr[i].splice(j, 1);
                    playersAvatarArr[i].splice(j, 1);

                    var counts = [];
                    for (k = 0; k < playersArr.length; k++) {
                        counts.push(playersArr[k].length);
                    }
                    var dt = { counts: counts };

                    for (k = 0; k < socksArr.length; k++) {
                        var sc = socksArr[k];
                        sc.forEach(function (item, index, arr) {

                            item.emit("roomPlayersCount", dt);

                        });
                    }

                    console.log('disconnected', thisClientId);
                    return;
                }
            }
        }

        for (i = 0; i < leagues.length; i++) {
            for (j = 0; j < leaguesPlayersArr[i].length; j++) {
                if (leaguesPlayersArr[i][j] == thisClientId) {
                    leaguesPlayersArr[i].splice(j, 1);
                    leagueSocksArr[i].splice(j, 1);
                    leaguesPlayersNameArr[i].splice(j, 1);
                    leaguesPlayersAvatarArr[i].splice(j, 1);
                }
            }

            var count = leaguesPlayersArr[i].length;
            var datal = { counts: count, playerName: leaguesPlayersNameArr[i] };
            //console.log(datal);
            for (k = 0; k < leagueSocksArr[i].length; k++) {
                leagueSocksArr[i][k].emit("OnGetLeaguePlayerCount", datal);
            }
        }



    });

});


function GetLeagues() {
    var dataQS = {
        var1: "something",
        var2: "something else"
    };

    var querystring = require("querystring");
    var qs = querystring.stringify(dataQS);
    var qslength = qs.length;
    var options = {
        hostname: "ashabrasaneh.ir",
        port: 80,
        path: "/GamesData/Hads/GetLeaguesForNjs.php",
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': qslength
        }
    };

    var buffer = "";
    var req = http.request(options, function (res) {
        res.on('data', function (chunk) {
            buffer += chunk;
        });
        res.on('end', function () {


            var dt = JSON.parse(buffer);
            for (var i = 0; i < dt.length; i++) {
                var lId = dt[i].leagueId;
                var mP = dt[i].maxPlayer;
                var plc = dt[i].playerCount;
                var canAdd = 1;
                for (var j = 0; j < leagues.length; j++) {
                    if (leagues[j] == lId) {
                        canAdd = 0;
                    }
                }
                if (canAdd == 1) {
                    leagues.push(lId);
                    LeaguePlayerCountMax.push(mP);
                    LeaguePlayerCount.push(plc);
                    leaguesPlayersArr.push([]);
                    leaguesPlayersNameArr.push([]);
                    leaguesPlayersAvatarArr.push([]);
                    leagueSocksArr.push([]);
                }

            }
            console.log("Leagues Added---ready for Play");
        });
    });

    req.write(qs);
    req.end();
}


