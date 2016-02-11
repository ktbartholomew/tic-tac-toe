var Sockets = require('./sockets');
var GameStorage = require('./storage/games');
var StatStorage = require('./storage/stats');

/**
 * Arbiter for all websocket connections in a game, which corresponds to a
 * single player's actions.
 *
 */
var WSConnection = function (options) {
  options = options || {};

  Object.defineProperty(this, 'id', {enumerable: true, value: options.id});
  Object.defineProperty(this, 'socket', {value: options.socket});

  addEventListeners.bind(this)();
  this.getStats();
};

WSConnection.prototype.sendMessage = function (message) {
  try {
    this.socket.send(JSON.stringify(message));
  } catch (e) {
    console.log(e.stack);
  }
};

WSConnection.prototype.getStats = function () {
  StatStorage.getStats()
  .then(function (stats) {
    this.sendMessage({
      action: 'statsUpdate',
      data: stats
    });
  }.bind(this));
};

WSConnection.prototype.destroy = function () {
  delete Sockets[this.id];
};

var addEventListeners = function () {
  this.socket.on('message', function (message) {
    var data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      return console.log('Message not valid JSON: %s', message);
    }

    if (typeof handlers[data.action] !== 'function') {
      return;
    }

    handlers[data.action].bind(this)(data.data, function (err, result) {
      if (result.send) {
        this.socket.send(JSON.stringify(result.send));
      }
    }.bind(this));
  }.bind(this));

  this.socket.on('close', function () {
    console.log('Socket %s is closing', this.id);
    GameStorage.getGamesWithPlayer(this.id)
    .then(function (cursor) {
      cursor.each(function (err, game) {
        GameStorage.removePlayer(game.id, this.id);
      }.bind(this));
    }.bind(this));

    this.destroy();
  }.bind(this));
};

var handlers = {
  joinGame: function (data, callback) {
    var socketId = this.id;
    var player;
    var team;

    // Try to join an open game. Returns null if there are no games to join.

    return GameStorage.joinOpenGame({
      socketId: socketId
    })
    .then(function (result) {
      var findMyTeam = function (socketId) {
        var myTeam;

        result.players.forEach(function (player) {
          if (player.socketId === socketId) {
            myTeam = player.team;
          }
        });

        return myTeam;
      };

      callback(null, {
        send: {
          action: 'joinGame',
          data: {
            gameId: result.id,
            team: findMyTeam(socketId)
          }
        }
      });
    });
  },
  fillSquare: function (data, callback) {
    GameStorage.getGame(data.gameId)
    .then(function (game) {
      game.fillSquare(data);

      return GameStorage.addMove(game);
    });
  },
  ping: function (data, callback) {
    callback(null, {
      send: {
        action: 'pong'
      }
    });
  }
};

module.exports = WSConnection;
