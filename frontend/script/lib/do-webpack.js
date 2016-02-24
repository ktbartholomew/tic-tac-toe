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

    console.log('[doWebpack] Packed %s modules into output file: %s',
      stats.compilation.modules.length,
      path.resolve(rootDir, 'src/dist/js/app.js')
    );
    callback(err, stats);
  });
};
