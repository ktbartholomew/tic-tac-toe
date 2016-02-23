var socket = require('../socket');

var subscribers = [];
var data = {};

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
    stats.forEach(function (stat) {
      data[stat.id] = stat.value;
    });

    subscribers.forEach(function (subscriber) {
      subscriber.call(null, data);
    });
  }
};

socket.addEventListener('message', handleMessage);

module.exports = {
  subscribe: function (callback) {
    subscribers.push(callback);
  }
};
