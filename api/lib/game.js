var Player = require('./player');

// Enums for game statuses
var WAITING = 'waiting';
var IN_PROGRESS = 'in-progress';
var ABANDONED = 'abandoned';
var FINISHED = 'finished';
var FINISHED_DRAW = 'finished-draw';

// Enums for things with which squares can be filled
var X = 'x';
var O = 'o';
var EMPTY = null;

var Game = function () {
  this.status = WAITING;
  this.next = X;
  this.players = [];
  // Start with an empty 3x3 grid
  this.grid = [[EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY], [EMPTY, EMPTY, EMPTY]];
  this.totalMoves = 0;
};

Game.prototype.addPlayer = function (socketId) {
  if (!this.isJoinable()) {
    return;
  }

  var newPlayer = new Player({
    game: this,
    socketId: socketId,
    team: (this.players.length === 0) ? X : O
  });

  this.broadcast({
    action: 'playerJoin',
    data: 'A player joined the game'
  });

  this.players.push(newPlayer);

  if (this.players.length == 2) {
    this.updateStatus(IN_PROGRESS);
  }

  newPlayer.sendMessage({
    action: 'updateGrid',
    data: {
      grid: this.grid
    }
  });

  return newPlayer;
};

Game.prototype.isJoinable = function () {
  // Player 1 (index 0) might disconnect before a friend joins. Don't throw a
  // second person into this abandoned game.
  if(this.status === ABANDONED) {
    return false;
  }

  // Otherwise, as long as there aren't already two people in the game, the
  // game is "joinable"
  return this.players.length < 2;
};

Game.prototype.updateStatus = function (status) {
  this.status = status;

  this.broadcast({
    action: 'updateGameStatus',
    data: {
      status: this.status
    }
  });
};

Game.prototype.fillSquare = function (options) {
  // Don't allow moves on abandoned or finished games.
  if([ABANDONED, FINISHED, FINISHED_DRAW].indexOf(this.status) !== -1) {
    return;
  }

  // make sure the right person is taking their turn
  if(options.team !== this.next) {
    return;
  }

  // x and y both need values
  if(typeof this.grid[options.x] === 'undefined' || typeof this.grid[options.x][options.y] === 'undefined') {
    return;
  }

  // Can't fill an already filled square
  if (this.grid[options.x][options.y] !== EMPTY) {
    return;
  }

  this.grid[options.x][options.y] = this.next;
  this.totalMoves++;

  // change the next filler to the opposite this one.
  this.next = (this.next === X) ? O : X;

  this.broadcast({
    action: 'updateGrid',
    data: {
      grid: this.grid
    }
  });

  if (this.isDraw()) {
    return this.updateStatus(FINISHED_DRAW);
  }

  var winner = this.getWinner();

  if (winner) {
    this.setWinner(winner);
    return this.updateStatus(FINISHED);
  }
};

Game.prototype.removePlayerFromGame = function (player) {
  if(this.status !== FINISHED && this.status !== FINISHED_DRAW) {
    this.updateStatus(ABANDONED);
  }

  this.players.forEach(function (item, index, array) {
    if (player.team === item.team) {
      array.splice(index, 1);
    }
  }.bind(this));
};

Game.prototype.setWinner = function (winner) {
  this.winner = winner;

  this.broadcast({
    action: 'updateWinner',
    data: {
      winner: winner
    }
  });
};

Game.prototype.getWinner = function () {
  if(this.isDraw()) {
    return null;
  }

  var winner = null;

  // There are 8 winning positions (3 horizontal, 3 vertical, 2 diagonal)
  winningVectors = [
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}],
    [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}],
    [{x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}],
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
    [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}],
    [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}],
    [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}],
    [{x: 2, y: 0}, {x: 1, y: 1}, {x: 0, y: 2}]
  ];

  winningVectors.forEach(function (vector) {
    var fillers = [
      this.grid[vector[0].x][vector[0].y],
      this.grid[vector[1].x][vector[1].y],
      this.grid[vector[2].x][vector[2].y]
    ];

    if (
      fillers[0] == fillers[1] &&
      fillers[1] == fillers[2] &&
      fillers[0] !== null
      ) {
      winner = fillers[0];
    }
  }.bind(this));

  return winner;
};

Game.prototype.isDraw = function () {
  return this.totalMoves === 9;
};

Game.prototype.broadcast = function (data) {
  this.players.forEach(function (player) {
    if(!player.isConnected()) {
      return;
    }

    player.sendMessage(data);
  });
};


module.exports = Game;
