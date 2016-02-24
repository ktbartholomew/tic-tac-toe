var red = '#CC523E';
var blue = '#698DCC';

var GridImage = new Image();
GridImage.src = '/grid.png';

var TTX = new Image();
TTX.src = '/x.png';

var TTCircle = new Image();
TTCircle.src = '/circle.png';

var FilledSquare = function (options) {
  this.created = new Date();
  this.sprite = options.sprite;
};


var GameRenderer = function (options) {
  this.game = options.game;
  this.grid = [[null,null,null],[null,null,null],[null,null,null]];
  this.animationInProgress = false;

  this.canvas = document.createElement('canvas');
  this.canvas.width = 768;
  this.canvas.height = 768;

  options.container.innerHTML = '';
  options.container.appendChild(this.canvas);

  this.canvas.addEventListener('click', clickOrTapHandler.bind(this));
  this.canvas.addEventListener('touchend', clickOrTapHandler.bind(this));
};

GameRenderer.prototype.updateGrid = function () {
  for(var i = 0; i < this.game.grid.length; i++) {
    for(var j = 0; j < this.game.grid[i].length; j++) {
      // If the grid has changed to null, we change to null. Pretty simple.
      if (this.game.grid[i][j] === null) {
        this.grid[i][j] = null;
        continue;
      }

      // If our square was null, fill it with whatever the new grid has.
      if (this.grid[i][j] === null) {
        this.grid[i][j] = new FilledSquare({
          sprite: (this.game.grid[i][j] === 'x') ? TTX : TTCircle
        });
        continue;
      }

      // Don't recreate the filledSquare if the sprite is unchanged
      if (this.game.grid[i][j] === 'x' && this.grid[i][j].sprite != TTX) {
        this.grid[i][j] = new FilledSquare({
          sprite: TTX
        });
        continue;
      }

      if (this.game.grid[i][j] === 'o' && this.grid[i][j].sprite != TTCircle) {
        this.grid[i][j] = new FilledSquare({
          sprite: TTCircle
        });
        continue;
      }
    }
  }

  this.render();
};

GameRenderer.prototype.render = function () {
  requestAnimationFrame(doRender.bind(this));
};

var doRender = function () {
  var ctx = this.canvas.getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  ctx.drawImage(GridImage, 0, 0, 768, 768);

  var animationInProgress = false;

  // Loop through and render the squares on the board
  for(var i = 0; i < this.grid.length; i++) {
    for(var j = 0; j < this.grid[i].length; j++) {
      if (this.grid[i][j]) {
        var age = new Date() - this.grid[i][j].created;

        if (age < 150) {
          animationInProgress = true;
        }

        var agingPercent = Math.min(age / 150, 1);
        agingPercent = agingPercent * agingPercent * agingPercent;

        var squareCoords = toCanvasGrid({x: i, y: j});

        squareCoords.x = squareCoords.x + 32 + (96 - 96 * agingPercent);
        squareCoords.y = squareCoords.y + 32 + (96 - 96 * agingPercent);

        ctx.drawImage(this.grid[i][j].sprite, squareCoords.x, squareCoords.y, 192 * agingPercent, 192 * agingPercent);
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

  if(animationInProgress) {
    this.render();
  }

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
