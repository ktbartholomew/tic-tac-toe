var ws = new WebSocket('ws://localhost:8081');

var getGameIdFromRoute = function () {
  var path = window.location.pathname;
  path = path.replace(/^[\/]?(.*?)[\/]?$/, '$1');
  path = path.split('/');

  if (path[0] === '') {
    return null;
  } else {
    return parseInt(path[0]);
  }
};

ws.addEventListener('open', function () {
  ws.send(JSON.stringify({
    action: 'joinGame',
    gameId: getGameIdFromRoute()
  }));
});

ws.addEventListener('message', function (e) {
  var data;
  try {
    data = JSON.parse(e.data);
  } catch (error) {
    console.error('Received malformed JSON from server: ' + e.data);
    console.error(error.stack);
  }

  try {
    actions[data.action].call(actions, {
      data: data.data
    }, function (err, result) {

    });
  } catch (error) {
    return console.log('Unsupported action: %s', data.action);
  }

});


var actions = {
  joinGame: function (options, callback) {
    window.history.pushState({}, '', '/' + options.data.gameId);
  }
};
