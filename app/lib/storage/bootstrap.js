var r = require('rethinkdb');

var Connection;
var DB_NAME = 'tictactoe';

module.exports = {
  getConnection: function () {
    return new Promise(function (resolve, reject) {
      if (Connection) {
        return resolve(Connection);
      }

      return r.connect({
        db: DB_NAME,
        host: process.env.RETHINKDB_HOST || 'ttt_db'
      })
      .then(function (conn) {
        Connection = conn;

        return;
      })
      .then(function () {
        return resolve(Connection);
      });
    });
  }
};
