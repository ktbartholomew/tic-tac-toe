var parseWSMessage = require('./parse-ws-message');
var Sockets = require('./sockets');

var Player = function (options) {
  options = options || {};

  if (!options.game) {
    throw new Error('options.team is required when instantiating a Player');
  }

  if (!options.socketId) {
    throw new Error('options.socketId is required when instantiating a Player');
  }

  if (!options.team) {
    throw new Error('options.team is required when instantiating a Player');
  }

  Object.defineProperty(this, 'game', {value: options.game});
  Object.defineProperty(this, 'socketId', {value: options.socketId, enumerable: true});
  Object.defineProperty(this, 'socket', {value: Sockets[options.socketId]});

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
  console.log(data);
  console.log(this);
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
  Sockets[this.socketId].on('message', handleMessage.bind(this));

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
