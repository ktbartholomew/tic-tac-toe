var socket = require('./socket');
var Game = require('./game');
var stats = require('./stats');

var activeGame = new Game({
  socket: socket,
  container: document.getElementById('game-container')
});

var rematch = function () {
  activeGame.leave();
  activeGame = new Game({
    socket: socket,
    container: document.getElementById('game-container')
  });
  activeGame.join();
};


document.getElementById('reset-game').addEventListener('click', function () {
  rematch();
});
