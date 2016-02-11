var Redis = require('./storage/redis');
var redisClient = Redis.getClient();
var Sockets = {};

Object.defineProperty(Sockets, 'publish', {
  value: function (socketId, message) {
    redisClient.publish('sockets:' + socketId, JSON.stringify(message));
  }
});

module.exports = Sockets;
