var socket = require('./socket');
// var GameRenderer = require('./renderer');
var Game = require('./game');

var activeGame = new Game({
  socket: socket,
  container: document.getElementById('game-container')
});


document.getElementById('reset-game').addEventListener('click', function () {
  activeGame.leave();
  activeGame = new Game({
    socket: socket,
    container: document.getElementById('game-container')
  });
  activeGame.join();
});
