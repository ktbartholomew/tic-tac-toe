var socket = require('./socket');

var handleMessage = function (e) {
  var message;
  try {
    message = JSON.parse(e.data);
  } catch (error) {
    console.error('Received malformed JSON from server: ' + e.data);
    console.error(error.stack);
  }

  if (typeof handlers[message.action] === 'function') {
    handlers[message.action](message.data);
  }
};

var handlers = {
  statsUpdate: function (stats) {
    var statElements = {
      totalMoves: document.getElementById('total-moves'),
      totalGames: document.getElementById('total-games'),
      abandonedGames: document.getElementById('abandoned-games'),
      tiedGames: document.getElementById('tied-games'),
      wonByX: document.getElementById('won-by-x'),
      wonByO: document.getElementById('won-by-o')
    };

    stats.forEach(function (stat) {
      if (statElements[stat.id] && stat.value.toString() !== statElements[stat.id].textContent) {
        requestAnimationFrame(function () {
          statElements[stat.id].textContent = stat.value.toString();
        });
      }
    });
  }
};

socket.addEventListener('message', handleMessage);
