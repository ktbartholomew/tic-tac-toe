var util = require('util');
var r = require('rethinkdb');

var rConn;
var DB_NAME = 'tictactoe';
var DB_TABLES = [
  'games',
  'stats'
];

r.connect({
  host: 'db',
  db: DB_NAME
})
.then(function (conn) {
  rConn = conn;

  bootstrapDB();
});

var bootstrapDB = function () {
  return r.dbList().run(rConn)
  .then(function (dbs) {
    if (dbs.indexOf(DB_NAME) === -1) {
      console.log('Creating DB ' + DB_NAME);
      return r.dbCreate(DB_NAME).run(rConn);
    }

    return dbs;
  })
  .then(function () {
    return r.dbList().run(rConn);
  })
  .then(function (dbs) {
    if(dbs.indexOf('test') !== -1) {
      console.log('Deleting DB test');
      return r.dbDrop('test').run(rConn);
    }

    return dbs;
  })
  .then(function () {
    return r.tableList().run(rConn);
  })
  .then(function (tables) {
    var promise;

    DB_TABLES.forEach(function (table) {
      if (tables.indexOf(table) === -1) {
        console.log('Creating table ' + table);
        promise = r.tableCreate(table).run(rConn);
      }
    });

    return promise;
  })
  .then(function () {
    return r.table('games').indexList().run(rConn);
  })
  .then(function (indexes) {
    if (indexes.indexOf('status') === -1) {
      console.log('Creating simple index \'status\' on table \'games\'');
      r.table('games').indexCreate('status').run(rConn);
      return indexes;
    }

    return indexes;
  })
  .then(function (indexes) {
    if (indexes.indexOf('playerSocketId') === -1) {
      console.log('Creating multi index \'playerSocketId\' on table \'games\'');
      r.table('games').indexCreate('playerSocketId', r.row('players')('socketId'), {multi: true}).run(rConn);
    }
  });
};

module.exports = {
  add: function (game) {
    return r.table('games').insert(game).run(rConn)
    .then(function (result) {
      return {id: result.generated_keys[0]};
    });
  },
  joinOpenGame: function (player) {
    return r.db('tictactoe')
    .table('games')
    .getAll('waiting', {index: 'status'})
    .limit(1)
    .update({
      status: 'in-progress',
      players: r.row('players').append(player)
    }, {returnChanges: true})
    .run(rConn)
    .then(function (result) {
      if (result.replaced === 0) {
        return null;
      }

      return {id: result.changes[0].old_val.id};
    });
  },
  getGame: function (id) {
    return r.table('games').get(id).run(rConn);
  },
  getGamesWithPlayer: function (playerId) {
    return r.table('games')
    .getAll(playerId, {index: 'playerSocketId'})
    .run(rConn);
  },
  updateStatus: function (id, status) {
    return r.table('games')
    .get(id)
    .update({
      status: status
    })
    .run(rConn);
  }
};
