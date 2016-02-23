var path = require('path');
var webpack = require('webpack');
var rootDir = require('./root-dir');

module.exports = function (callback) {
  callback = callback || function () {};

  webpack(require('./webpack-config'), function (err, stats) {
    if (err) {
      console.log(err);
      return;
    }
    console.log('[doWebpack] Wrote ' + path.resolve(rootDir, 'src/dist/js/app.js'));

    callback(err, stats);
  });
};
