var r = require('rethinkdb');
var WebSocket = require('ws');

var ws = new WebSocket('wss://tictac.io/live/');
var conn = null;

r.connect({host: process.env.DB_HOST, db: 'tictactoe'})
.then(function (connection) {
  conn = connection;
});

var emptyGrid = [[null, null, null],[null, null, null],[null, null, null]];

var currentGame = {
  id: null,
  team: null,
  grid: emptyGrid,
  winner: null,
  frames: []
};

var gridToFrame = function (grid) {
  // convert a 2-dimensional grid array to a 9-character string of only [0-2]
  // 0 is empty
  // 1 is X
  // 2 is O

  var frame = ['0','0','0','0','0','0','0','0','0'];

  grid.forEach(function (column, xIndex) {
    // Each element of grid is a column.
    column.forEach(function (cell, yIndex) {
      // Each element of the column is a cell, from top to bottom.
      // We can translate the position in the 2d-array to the 1d array with this
      // little formula:
      var frameIndex = (yIndex * 3) + xIndex;

      switch (cell) {
        case null:
          frame[frameIndex] = '0';
        break;
        case 'x':
          frame[frameIndex] = '1';
        break;
        case 'o':
          frame[frameIndex] = '2';
        break;
      }
    });
  });

  return frame.join('');
};

var playToFrame = function (play) {
  // we will switch one of the characters in this string to 1 or 2, for X or O.
  var frame = ['0','0','0','0','0','0','0','0','0'];
  var playIndex = (play.coords.y * 3) + play.coords.x;
  frame[playIndex] = (play.team === 'x') ? '1' : '2';

  // squash the array to a string
  return frame.join('');
};

var storeFrames = function (currentGame) {
  var winner;
  if (currentGame.winner === null) {
    winner = '0';
  } else {
    winner = (currentGame.winner === 'x') ? '1' : '2';
  }

  currentGame.frames.forEach(function (frame, index, scope) {
    scope[index].result = winner;
  });

  return r.table('bot_stats').insert(currentGame.frames).run(conn);
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

  if (!square) {
    return {};
  }

  // Record the move in our list of frames, which will be submitted to the DB
  // when we know who wins.
  currentGame.frames.push({
    state: gridToFrame(currentGame.grid),
    action: playToFrame({team: currentGame.team, coords: square}),
    result: null
  });

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
  updateWinner: function (data) {
    currentGame.winner = data.winner;
  },
  updateGameStatus: function (data) {
    if (data.status === 'in-progress') {
      if (isItMyTurn()) {
        return waitThenSend(move());
      }
    }

    if (['finished', 'finished-draw', 'abandoned'].indexOf(data.status) !== -1) {
      storeFrames(currentGame).then(function () {
        currentGame.id = null;
        currentGame.team = null;
        currentGame.grid = emptyGrid;
        currentGame.winner = null;
        currentGame.frames = [];

        waitThenSend({
          action: 'joinGame',
          data: null
        });
      });
    }
  }
};
