var uuid = require('node-uuid');
var WebSocketServer = require('ws').Server;

var Sockets = require('./lib/sockets');
var GameStorage = require('./lib/game-storage');
var Game = require('./lib/game');

var server = new WebSocketServer({ port: 8081 });

var actions = {
  joinGame: function (data, callback) {
    var player;
    var team;

    // Try to join an open game. Returns null if there are no games to join.

    return GameStorage.joinOpenGame({
      socketId: data.clientId,
      team: 'o'
    })
    .then(function (result) {
      if (result === null) {
        team = 'x';
        // There were no games to join, so create a new game and join that.
        var newGame = new Game();
        player = newGame.addPlayer(data.clientId);

        return GameStorage.add(newGame);
      }

      team = 'o';

      return result;
    })
    .then(function (result) {
      callback(null, {
        send: {
          action: 'joinGame',
          data: {
            gameId: result.id,
            team: team
          }
        }
      });
    });
  },
  fillSquare: function (data, callback) {
    // console.log('fill square, eh?');
    // console.log(data);
  }
};

server.on('connection', function connection(client) {
  var clientId = uuid.v4();
  Sockets[clientId] = client;

  Sockets[clientId].on('message', function incoming(message) {
    var data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      return console.log('Message not valid JSON: %s', message);
    }

    if (typeof actions[data.action] !== 'function') {
      return;
    }

    actions[data.action].call(actions, {
      clientId: clientId,
      data: data
    }, function (err, result) {
      if (result.send) {
        Sockets[clientId].send(JSON.stringify(result.send));
      }
    });
  });

  Sockets[clientId].on('close', function () {
    console.log('Socket %s is closing', clientId);
    GameStorage.getGamesWithPlayer(clientId)
    .then(function (cursor) {
      cursor.each(function (err, game) {
        GameStorage.updateStatus(game.id, 'abandoned');
      });
    });

    delete Sockets[clientId];
  });
});
