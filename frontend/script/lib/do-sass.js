var fs = require('fs');
var path = require('path');
var sass = require('node-sass');
var cssmin = require('cssmin');
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

    // Minify the compiled scss.
    var minified = cssmin(result.css.toString());

    var outputFile = path.resolve(rootDir, 'src/dist/css/main.css');
    fs.writeFile(outputFile, minified, function (err, result) {
      console.log('[doSass] Wrote ' + outputFile);
      return callback(err, result);
    });
  });
};
