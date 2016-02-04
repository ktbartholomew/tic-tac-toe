var fs = require('fs');
var path = require('path');
var sass = require('node-sass');
var rootDir = require('./root-dir');

module.exports = function (callback) {
  callback = callback || function () {};

  sass.render({
    file: path.resolve(rootDir, 'src/src/sass/main.scss'),
    outputStyle: 'expanded'
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    var outputFile = path.resolve(rootDir, 'src/dist/css/main.css');

    fs.writeFile(outputFile, result.css, function (err, result) {
      console.log('[doSass] Wrote ' + outputFile);
      return callback(err, result);
    });
  });
};
