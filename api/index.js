var express = require('express');
var WebSocketServer = require('ws').Server;

var app = express();

app.get('/', function (req, res) {
  res.send({status: 'ok'});
});

app.listen(8080);

var wss = new WebSocketServer({ port: 8081 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('message received');
});
