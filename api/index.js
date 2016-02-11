var uuid = require('node-uuid');
var WebSocketServer = require('ws').Server;

var WSConnection = require('./lib/ws-connection');
var Sockets = require('./lib/sockets');
var StatsFeed = require('./lib/stats-feed');

var server = new WebSocketServer({ port: 8081 });

server.on('connection', function connection(client) {
  var clientId = uuid.v4();
  Sockets[clientId] = new WSConnection({
    id: clientId,
    socket: client
  });
});

StatsFeed.init();
