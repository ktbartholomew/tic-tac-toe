var path = require('path');
var webpack = require('webpack');
var rootDir = require('./root-dir');

module.exports = {
  context: rootDir,
  entry: path.resolve(rootDir, 'src/src/js/app.js'),
  output: {
    path: path.resolve(rootDir, 'src/dist/js'),
    publicPath: '/dist/js',
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ],
    noParse: []
  },
  plugins: []
};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  );
}
