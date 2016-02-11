var wsProtocol = (window.location.protocol === 'https:') ? 'wss://' : 'ws://';

var ws = new WebSocket(wsProtocol + window.location.hostname + '/live/');
// var ws = new WebSocket(wsProtocol + 'docker:8080/');

ws.addEventListener('open', function (e) {
  requestAnimationFrame(function () {
    document.getElementById('butterbar').classList.add('hide');
  });
});

ws.addEventListener('close', function (e) {
  requestAnimationFrame(function () {
    document.getElementById('butterbar').classList.remove('hide');
  });
});

module.exports = ws;

setInterval(function () {
  ws.send(JSON.stringify({action: 'ping'}));
}, 30000);
