var WebSocket = require('ws');
var ws = new WebSocket('wss://tictac.io/live/');

var emptyGrid = [[null, null, null],[null, null, null],[null, null, null]];

var currentGame = {
  id: null,
  team: null,
  grid: emptyGrid
};

var send = function (data) {
  ws.send(JSON.stringify(data));
};

var waitThenSend = function (data) {
  var minWait = 80;
  var maxWait = 200;

  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      send(data);
      return resolve();
    }, Math.floor(Math.random() * maxWait) + minWait);
  });
};

var move = function () {

  var pickASquare = function () {
    var choices = [];

    for (var i = 0; i <= 2; i++) {
      for (var j = 0; j <= 2; j++) {
        if (currentGame.grid[i][j] === null) {
          choices.push({
            x: i,
            y: j
          });
        }
      }
    }

    return choices[Math.floor(Math.random() * (choices.length - 1))];
  };

  var square = pickASquare();
  console.log('[%s] Playing %j', new Date(), square);

  return {
    action: 'fillSquare',
    data: {
      gameId: currentGame.id,
      team: currentGame.team,
      coords: square
    }
  };
};

var isItMyTurn = function () {
  var filledSquares = 0;

  for (var i = 0; i <= 2; i++) {
    for (var j = 0; j <= 2; j++) {
      if (currentGame.grid[i][j] !== null) {
        filledSquares++;
      }
    }
  }

  if (currentGame.team === 'x') {
    return (filledSquares % 2 === 0);
  }

  if (currentGame.team === 'o') {
    return (filledSquares % 2 !== 0);
  }
};

ws.on('open', function () {
  send({
    action: 'joinGame',
    data: null
  });

  setInterval(function () {
    send({
      action: 'ping'
    });
  }, 20000);
});

ws.on('message', function (data) {
  data = JSON.parse(data);

  if (typeof handlers[data.action] === 'function') {
    handlers[data.action](data.data);
  }
});

var handlers = {
  joinGame: function (data) {
    console.log('[%s] Joining game %s as player %s', new Date(), data.gameId, data.team);
    currentGame.id = data.gameId;
    currentGame.team = data.team;

    if (isItMyTurn()) {
      waitThenSend(move());
    }
  },
  updateGrid: function (data) {
    currentGame.grid = data.grid;

    if (!currentGame.team) {
      return;
    }

    if (isItMyTurn()) {
      waitThenSend(move());
    }
  },
  updateGameStatus: function (data) {
    if (data.status === 'in-progress') {
      if (isItMyTurn()) {
        return waitThenSend(move());
      }
    }

    if (['finished', 'finished-draw', 'abandoned'].indexOf(data.status) !== -1) {
      currentGame.id = null;
      currentGame.team = null;
      currentGame.grid = emptyGrid;

      waitThenSend({
        action: 'joinGame',
        data: null
      });
    }
  }
};
