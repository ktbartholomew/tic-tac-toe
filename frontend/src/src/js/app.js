var React = require('react');
var ReactDOM = require('react-dom');
var socket = require('./socket');
var Game = require('./game');
var StatsFeed = require('./stats/feed');
var StatsTable = require('./stats/table');

var activeGame = new Game({
  socket: socket,
  container: document.getElementById('game-container')
});

ReactDOM.render(<StatsTable feed={StatsFeed}/>, document.getElementById('stats-table'));
