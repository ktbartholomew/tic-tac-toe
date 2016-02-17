var path = require('path');
var webpack = require('webpack');
var rootDir = require('./root-dir');

module.exports = function (callback) {
  callback = callback || function () {};

  webpack({
    entry: path.resolve(rootDir, 'src/src/js/app.js'),
    output: {
      path: path.resolve(rootDir, 'src/dist/js'),
      filename: 'app.js'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  }, function (err, stats) {
    console.log('[doWebpack] Wrote ' + path.resolve(rootDir, 'src/dist/js/app.js'));

    callback(err, stats);
  });
};
