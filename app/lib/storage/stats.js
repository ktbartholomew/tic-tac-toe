var r = require('rethinkdb');
var bootstrap = require('./bootstrap');

var StatStorage = {
  increment: function (stat) {
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('stats').get(stat)
      .update({
        value: r.row('value').add(1)
      })
      .run(rConn);
    });
  },
  subscribe: function (callback) {
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('stats').changes().run(rConn, function (err, cursor) {
        console.log(arguments);
        cursor.each(callback);
      });
    });
  },
  getStats: function () {
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('stats').run(rConn);
    })
    .then(function (cursor) {
      return cursor.toArray();
    });
  }
};

module.exports = StatStorage;
