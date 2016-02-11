var WebSocket = require('ws');
var ws = new WebSocket('wss://xo.appfound.co/live/');

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
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      send(data);
      return resolve();
    }, Math.floor(Math.random() * 1800) + 800);
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

ws.on('open', function () {
  send({
    action: 'joinGame',
    data: null
  });
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

    if (data.team === 'x') {
      waitThenSend(move());
    }
  },
  updateGrid: function (data) {
    currentGame.grid = data.grid;
    waitThenSend(move());
  },
  updateGameStatus: function (data) {
    if (data.status === 'in-progress') {
      return waitThenSend(move());
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
