var r = require('rethinkdb');

var Connection;

var DB_NAME = 'tictactoe';
var DB_TABLES = [
  'games',
  'stats'
];

var bootstrap = function () {
  return r.dbList().run(Connection)
  .then(function (dbs) {
    if (dbs.indexOf(DB_NAME) === -1) {
      console.log('Creating DB ' + DB_NAME);
      return r.dbCreate(DB_NAME).run(Connection);
    }

    return dbs;
  })
  .then(function () {
    return r.dbList().run(Connection);
  })
  .then(function (dbs) {
    if(dbs.indexOf('test') !== -1) {
      console.log('Deleting DB test');
      return r.dbDrop('test').run(Connection);
    }

    return dbs;
  })
  .then(function () {
    return r.tableList().run(Connection);
  })
  .then(function (tables) {
    var promise;

    DB_TABLES.forEach(function (table) {
      if (tables.indexOf(table) === -1) {
        console.log('Creating table ' + table);
        promise = r.tableCreate(table).run(Connection);
      }
    });

    return promise;
  })
  .then(function () {
    return r.table('games').indexList().run(Connection);
  })
  .then(function (indexes) {
    if (indexes.indexOf('status') === -1) {
      console.log('Creating simple index \'status\' on table \'games\'');
      r.table('games').indexCreate('status').run(Connection);
      return indexes;
    }

    return indexes;
  })
  .then(function (indexes) {
    if (indexes.indexOf('playerSocketId') === -1) {
      console.log('Creating multi index \'playerSocketId\' on table \'games\'');
      r.table('games').indexCreate('playerSocketId', r.row('players')('socketId'), {multi: true}).run(Connection);
    }
  })
  .then(function () {
    return r.table('stats').get('totalMoves').run(Connection);
  })
  .then(function (totalMoves) {
    if (totalMoves !== null) {
      return totalMoves;
    }

    console.log('Creating stats document \'totalMoves\'');
    return r.table('stats').insert({
      id: 'totalMoves',
      value: 0
    }).run(Connection);
  })
  .then(function () {
    return r.table('stats').get('totalGames').run(Connection);
  })
  .then(function (totalGames) {
    if (totalGames !== null) {
      return totalGames;
    }

    console.log('Creating stats document \'totalGames\'');
    return r.table('stats').insert({
      id: 'totalGames',
      value: 0
    }).run(Connection);
  })
  .then(function () {
    return r.table('stats').get('abandonedGames').run(Connection);
  })
  .then(function (abandonedGames) {
    if (abandonedGames !== null) {
      return abandonedGames;
    }

    console.log('Creating stats document \'abandonedGames\'');
    return r.table('stats').insert({
      id: 'abandonedGames',
      value: 0
    }).run(Connection);
  })
  .then(function () {
    return r.table('stats').get('tiedGames').run(Connection);
  })
  .then(function (tiedGames) {
    if (tiedGames !== null) {
      return tiedGames;
    }

    console.log('Creating stats document \'tiedGames\'');
    return r.table('stats').insert({
      id: 'tiedGames',
      value: 0
    }).run(Connection);
  })
  .then(function () {
    return r.table('stats').get('wonByX').run(Connection);
  })
  .then(function (wonByX) {
    if (wonByX !== null) {
      return wonByX;
    }

    console.log('Creating stats document \'wonByX\'');
    return r.table('stats').insert({
      id: 'wonByX',
      value: 0
    }).run(Connection);
  })
  .then(function () {
    return r.table('stats').get('wonByO').run(Connection);
  })
  .then(function (wonByO) {
    if (wonByO !== null) {
      return wonByO;
    }

    console.log('Creating stats document \'wonByO\'');
    return r.table('stats').insert({
      id: 'wonByO',
      value: 0
    }).run(Connection);
  });
};

module.exports = {
  getConnection: function () {
    return new Promise(function (resolve, reject) {
      if (Connection) {
        return resolve(Connection);
      }

      return r.connect({
        db: DB_NAME,
        host: process.env.RETHINKDB_HOST || 'db'
      })
      .then(function (conn) {
        Connection = conn;

        return bootstrap();
      })
      .then(function () {
        return resolve(Connection);
      });
    });
  }
};
