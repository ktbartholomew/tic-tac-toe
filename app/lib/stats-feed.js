var Sockets = require('./sockets');
var StatStorage = require('./storage/stats');

module.exports = {
  init: function () {
    StatStorage.subscribe(function (err, change) {
      if (err) {
        console.log(err);
        return;
      }

      for(var socketId in Sockets) {
        Sockets.publish(socketId, {
          action: 'statsUpdate',
          data: [change.new_val]
        });
      }
    });
  }
};
