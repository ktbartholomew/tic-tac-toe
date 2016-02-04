var express = require('express');
var WebSocketServer = require('ws').Server;

var app = express();

app.get('/', function (req, res) {
  res.send({status: 'ok'});
});

app.listen(8080);

var server = new WebSocketServer({ port: 8081 });

var Games = {};
var nextGameIndex = 1;
var Game = require('./lib/game');

var findOpenGame = function (games) {
  var openGameIndex = null;
  for(var index in games) {
    if (games.hasOwnProperty(index)) {
      if (games[index].isJoinable()) {
        openGameIndex = index;
        break;
      }
    }
  }

  return openGameIndex;
};

var actions = {
  joinGame: function (options, callback) {
    var gameIndex;

    if (findOpenGame(Games) !== null) {
      gameIndex = findOpenGame(Games);
      Games[gameIndex].addPlayer(options.client);
    } else {
      gameIndex = nextGameIndex++;
      var newGame = new Game();
      newGame.addPlayer(options.client);

      Games[gameIndex] = newGame;
    }

    callback(null, {
      send: {
        action: 'joinGame',
        data: {
          gameId: gameIndex
        }
      }
    });
  }
};

server.on('connection', function connection(client) {
  client.on('message', function incoming(message) {
    var data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      return console.log('Message not valid JSON: %s', message);
    }

    try {
      actions[data.action].call(actions, {
        client: client,
        data: data
      }, function (err, result) {
        if (result.send) {
          client.send(JSON.stringify(result.send));
        }
      });
    } catch (e) {
      console.log('Unsupported action: %s', data.action);
      throw e;
    }
  });
});
