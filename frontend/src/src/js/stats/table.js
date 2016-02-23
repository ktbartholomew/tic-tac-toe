var React = require('react');

var Table = React.createClass({
  getInitialState: function () {
    return {
      data: {}
    };
  },
  componentDidMount: function () {
    var self = this;
    this.props.feed.subscribe(function (update) {
      self.setState({data: update});
    });
  },
  render: function () {
    return (
      <table>
        <tbody>
          <tr>
            <th>Total Moves</th>
            <td className="number">{this.state.data.totalMoves}</td>
          </tr>
          <tr>
            <th>Total Games</th>
            <td className="number">{this.state.data.totalGames}</td>
          </tr>
          <tr>
            <th>Abandoned Games</th>
            <td className="number">{this.state.data.abandonedGames}</td>
          </tr>
          <tr>
            <th>Tied Games</th>
            <td className="number">{this.state.data.tiedGames}</td>
          </tr>
          <tr>
            <th>Games won by X</th>
            <td className="number">{this.state.data.wonByX}</td>
          </tr>
          <tr>
            <th>Games won by O</th>
            <td className="number">{this.state.data.wonByO}</td>
          </tr>
        </tbody>
      </table>
    );
  }
});

module.exports = Table;
