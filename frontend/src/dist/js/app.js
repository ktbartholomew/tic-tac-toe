/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var socket = __webpack_require__(1);
	// var GameRenderer = require('./renderer');
	var Game = __webpack_require__(2);

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


/***/ },
/* 1 */
/***/ function(module, exports) {

	var ws = new WebSocket('ws://localhost:8081');

	module.exports = ws;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var GameRenderer = __webpack_require__(3);

	var WAITING = 'waiting';
	var IN_PROGRESS = 'in-progress';
	var ABANDONED = 'abandoned';
	var FINISHED = 'finished';
	var FINISHED_DRAW = 'finished-draw';

	var Game = function (options) {
	  this.socket = options.socket;
	  this.id = null;
	  this.status = WAITING;
	  this.winner = null;
	  this.myTeam = null;
	  this.next = 'x';
	  this.grid = [
	    [
	      null,
	      null,
	      null
	    ],
	    [
	      null,
	      null,
	      null
	    ],
	    [
	      null,
	      null,
	      null
	    ]
	  ];

	  this.renderer = new GameRenderer({
	    game: this,
	    container: options.container
	  });

	  this.renderer.render();

	  this.socket.addEventListener('open', this.join.bind(this));
	  this.socket.addEventListener('message', handleMessage.bind(this));
	};

	Game.prototype.fillSquare = function (options) {
	  this.socket.send(JSON.stringify({
	    action: 'fillSquare',
	    data: {
	      coords: {
	        x: options.x,
	        y: options.y,
	      },
	      team: this.myTeam
	    }
	  }));
	};

	Game.prototype.join = function () {
	  this.socket.send(JSON.stringify({
	    action: 'joinGame',
	    gameId: null
	  }));
	};

	Game.prototype.leave = function () {
	  this.socket.send(JSON.stringify({
	    action: 'leaveGame',
	    data: {
	      team: this.myTeam
	    }
	  }));
	};

	var handleMessage = function (e) {
	  var message;
	  try {
	    message = JSON.parse(e.data);
	  } catch (error) {
	    console.error('Received malformed JSON from server: ' + e.data);
	    console.error(error.stack);
	  }

	  if (typeof handlers[message.action] === 'function') {
	    handlers[message.action].bind(this)(message);
	  }
	};

	var handlers = {
	  joinGame: function (message) {
	    this.id = message.data.gameId;
	    this.myTeam = message.data.team;

	    handlers.updateGameStatus.bind(this)({
	      data: {
	        status: (this.myTeam === 'x') ? WAITING : IN_PROGRESS
	      }
	    });

	    // window.history.pushState({}, '', '/' + this.id);

	    requestAnimationFrame(function () {
	      document.getElementById('game-id').textContent = this.id;
	      document.getElementById('game-team').textContent = this.myTeam.toUpperCase();
	    }.bind(this));
	  },
	  updateGameStatus: function (message) {
	    this.status = message.data.status;
	    var statusString;

	    switch(this.status) {
	      case IN_PROGRESS:
	        statusString = 'In progress';
	      break;
	      case WAITING:
	        statusString = 'Waiting for opponent to join';
	      break;
	      case ABANDONED:
	        statusString = 'Abandoned (a player left the game)';
	      break;
	      case FINISHED:
	        statusString = 'Finished';
	      break;
	      case FINISHED_DRAW:
	        statusString = 'Draw';
	      break;
	    }

	    requestAnimationFrame(function () {
	      document.getElementById('game-status').textContent = statusString;
	    }.bind(this));
	  },
	  updateGrid: function (message) {
	    this.grid = message.data.grid;
	    this.renderer.render();
	  },
	  updateWinner: function (message) {
	    this.winner = message.data.winner;
	  }
	};

	module.exports = Game;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var red = '#CC523E';
	var blue = '#698DCC';

	var TTX = new Image();
	TTX.src = '/x.svg';

	var TTCircle = new Image();
	TTCircle.src = '/circle.svg';

	var GameRenderer = function (options) {
	  this.game = options.game;

	  this.canvas = document.createElement('canvas');
	  this.canvas.width = 768;
	  this.canvas.height = 768;

	  options.container.innerHTML = '';
	  options.container.appendChild(this.canvas);

	  this.canvas.addEventListener('click', clickOrTapHandler.bind(this));
	  this.canvas.addEventListener('touchend', clickOrTapHandler.bind(this));
	};

	GameRenderer.prototype.render = function () {
	  requestAnimationFrame(doRender.bind(this));
	};

	var doRender = function () {
	  var ctx = this.canvas.getContext('2d');
	  ctx.save();
	  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	  // The grid for the tic-tac-toe board
	  var gridImage = new Image();

	  // This onload event does the rendering the first time this image is used.
	  // After that, the image is cached and loads instantly.
	  gridImage.onload = function () {
	    // ctx.drawImage(gridImage, 0, 0, 768, 768);
	  };
	  gridImage.src = '/grid.svg';
	  ctx.drawImage(gridImage, 0, 0, 768, 768);

	  // Loop through and render the squares on the board
	  for(var i = 0; i < this.game.grid.length; i++) {
	    for(var j = 0; j < this.game.grid[i].length; j++) {
	      if (this.game.grid[i][j]) {
	        var squareCoords = toCanvasGrid({x: i, y: j});

	        squareCoords.x = squareCoords.x + 32;
	        squareCoords.y = squareCoords.y + 32;

	        var filledWith = (this.game.grid[i][j] === 'x') ? TTX : TTCircle;

	        ctx.drawImage(filledWith, squareCoords.x, squareCoords.y, 192, 192);
	      }
	    }
	  }

	  // If there's a winner, show who won
	  if (this.game.winner) {
	    var winnerName;
	    if(this.game.winner == 'x') {
	      winnerName = 'Red';
	      ctx.fillStyle = red;
	    } else {
	      winnerName = 'Blue';
	      ctx.fillStyle = blue;
	    }

	    ctx.fillRect(0, 352, 768, 64);

	    ctx.font = '48px sans-serif';
	    ctx.fillStyle = 'white';
	    ctx.textBaseline = 'middle';
	    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
	    ctx.shadowBlur = 4;
	    ctx.shadowOffsetY = 0;
	    ctx.textAlign = 'center';
	    ctx.fillText(winnerName + ' wins!', 384, 384);
	  }

	  ctx.restore();
	  // requestAnimationFrame(render);
	};

	// convert a pixel coordinate (the size of the canvas) to a game coordinate
	// (a 0-indexed tic-tac-toe grid)
	var toTTGrid = function (coords) {
	  var grid = {
	    x: 0,
	    y: 0
	  };

	  grid.x = parseInt(coords.x/256);
	  grid.y = parseInt(coords.y/256);

	  return grid;
	};

	var toCanvasGrid = function (coords) {
	  var grid = {
	    x: 0,
	    y: 0
	  };

	  grid.x = coords.x * 256;
	  grid.y = coords.y * 256;

	  return grid;
	};

	var clickOrTapHandler = function (e) {
	  // Prevent taps from turning into clicks
	  e.preventDefault();

	  var eventPos = {
	    x: e.clientX || e.changedTouches[0].clientX,
	    y: e.clientY || e.changedTouches[0].clientY
	  };

	  var canvasPos = {
	    x: 0,
	    y: 0
	  };

	  canvasPos.x = (eventPos.x - this.canvas.offsetLeft) * this.canvas.width / this.canvas.offsetWidth;
	  canvasPos.y = (eventPos.y - this.canvas.offsetTop) * this.canvas.height / this.canvas.offsetHeight;

	  var ttCoords = toTTGrid(canvasPos);

	  this.game.fillSquare(ttCoords);
	};

	module.exports = GameRenderer;


/***/ }
/******/ ]);