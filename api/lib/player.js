var parseWSMessage = require('./parse-ws-message');

var Player = function (options) {
  options = options || {};

  if (!options.game) {
    throw new Error('options.team is required when instantiating a Player');
  }

  if (!options.socket) {
    throw new Error('options.socket is required when instantiating a Player');
  }

  if (!options.team) {
    throw new Error('options.team is required when instantiating a Player');
  }

  this.game = options.game;
  this.socket = options.socket;
  this.team = options.team;

  addEventListeners.bind(this)();
};

Player.prototype.isConnected = function () {
  return (this.socket.readyState === this.socket.OPEN);
};

Player.prototype.sendMessage = function (message) {
  this.socket.send(JSON.stringify(message));
};

Player.prototype.fillSquare = function (data) {
  var coords = data.coords;

  this.game.fillSquare({
    x: coords.x,
    y: coords.y,
    team: this.team
  });
};

Player.prototype.leaveGame = function () {
  this.game.removePlayerFromGame(this);
};

var addEventListeners = function () {
  this.socket.on('message', handleMessage.bind(this));

  this.socket.on('close', function () {
    try {
      return this.leaveGame();
    } catch (e) {
      console.log(e.stack);
    }
  }.bind(this));
};

var handleMessage = function (e) {
  try {
    var message = JSON.parse(e);

    if (typeof handlers[message.action] === 'function') {
      handlers[message.action].bind(this)(message);
    }
  } catch (error) {
    console.error(error.stack);
  }
};

var handlers = {
  fillSquare: function (message) {
    return this.fillSquare(message.data);
  },
  leaveGame: function (message) {
    return this.leaveGame();
  }
};

module.exports = Player;
