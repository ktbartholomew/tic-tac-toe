var r = require('rethinkdb');

var bootstrap = require('./bootstrap');
var StatStorage = require('./stats');
var Game = require('../game');

module.exports = {
  add: function (game) {
    StatStorage.increment('totalGames');

    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('games').insert(game, {returnChanges: true}).run(rConn);
    })
    .then(function (result) {
      return result.changes[0].new_val;
    });
  },
  joinOpenGame: function (player) {
    // Try to join a game as player "O"
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.db('tictactoe')
      .table('games')
      .getAll('waiting', {index: 'status'})
      .limit(1)
      .run(rConn);
    })
    .then(function (cursor) {
      return cursor.toArray();
    })
    .then(function (result) {
      var game;
      if (result.length === 0) {
        // No games were open, so create a new game as player "X".
        game = new Game();
        game.addPlayer(player.socketId);
        return this.add(game)
        .then(function (game) {
          console.log('Player %s joined game %s', player.socketId, game.id);
          return game;
        });
      }

      // Otherwise, result is a game matching {status: 'waiting'}
      game = new Game(result[0]);
      game.addPlayer(player.socketId);
      console.log('Player %s joined game %s', player.socketId, game.id);

      return this.update(game);
    }.bind(this));
  },
  getGame: function (id) {
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('games').get(id).run(rConn);
    })
    .then(function (game) {
      return new Game(game);
    });
  },
  getGamesWithPlayer: function (playerId) {
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('games')
      .getAll(playerId, {index: 'playerSocketId'})
      .run(rConn);
    });
  },
  updateStatus: function (id, status) {
    this.getGame(id)
    .then(function (game) {
      game.updateStatus(status);

      return this.update(game);
    }.bind(this));
  },
  removePlayer: function (gameId, playerId) {
    this.getGame(gameId)
    .then(function (game) {
      game.removePlayer(playerId);

      if (game.status === 'abandoned') {
        StatStorage.increment('abandonedGames');
      }

      return this.update(game);
    }.bind(this));
  },
  update: function (game) {
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('games')
      .get(game.id)
      .update(game, {returnChanges: true})
      .run(rConn);
    })
    .then(function (result) {
      if (result.changes[0]) {
        return result.changes[0].new_val;
      }
    });
  },
  addMove: function (game) {
    StatStorage.increment('totalMoves');

    if (game.winner === 'x') {
      StatStorage.increment('wonByX');
    }

    if (game.winner === 'o') {
      StatStorage.increment('wonByO');
    }

    if (game.status === 'finished-draw') {
      StatStorage.increment('tiedGames');
    }
    return bootstrap.getConnection()
    .then(function (rConn) {
      return r.table('games')
      .get(game.id)
      .update({
        status: game.status,
        next: game.next,
        grid: game.grid,
        totalMoves: game.totalMoves,
        winner: game.winner
      })
      .run(rConn);
    });
  }
};
