// Enums for game statuses
var WAITING = 'waiting';
var IN_PROGRESS = 'in-progress';
var ABANDONED = 'abandoned';
var FINISHED = 'finished';

var Game = function () {
  this.status = WAITING;
  this.players = [];
  // Start with an empty 3x3 grid
  this.grid = [[null, null, null], [null, null, null], [null, null, null]];
};

Game.prototype.addPlayer = function (player) {
  if (!this.isJoinable()) {
    return;
  }

  this.broadcast({
    action: 'playerJoin',
    data: 'A player joined the game'
  });
  this.players.push(player);

  if (this.players.length == 2) {
    this.startGame();
  }
};

Game.prototype.isJoinable = function () {
  // Player 1 (index 0) might disconnect before a friend joins. Don't throw a
  // second person into this abandoned game.
  if (this.players[0]) {
    if (this.players[0].readyState !== this.players[0].OPEN) {
      return false;
    }
  }

  // Otherwise, as long as there aren't already two people in the game, the
  // game is "joinable"
  return this.players.length < 2;
};

Game.prototype.startGame = function () {
  this.status = IN_PROGRESS;

  this.broadcast({
    action: 'changeGameStatus',
    data: {
      status: this.status
    }
  });
};

Game.prototype.broadcast = function (data) {
  this.players.forEach(function (player) {
    if(player.readyState !== player.OPEN) {
      return;
    }

    player.send(JSON.stringify(data));
  });
};


module.exports = Game;
