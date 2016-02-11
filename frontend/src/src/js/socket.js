var ws = new WebSocket('ws://' + 'docker' + '/live/');
module.exports = ws;

setInterval(function () {
  ws.send(JSON.stringify({action: 'ping'}));
}, 30000);
