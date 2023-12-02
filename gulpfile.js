/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are split into several files in the gulp directory
 *  because putting it all here was too long
 */

'use strict';

var gulp = require('gulp');
const fs = require('fs');

fs.readdirSync('./.gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./.gulp/' + file);
});


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', function () {
    console.log("//////////////////////////////////////////////////////////////////////////");
    console.log("This is the local gulp, not moonbase gulp. Available gulp tasks: ['deploy']");
    console.log("Please run gulp followed by a task, or type make to invocate Moonbase Gulp.");
    console.log("//////////////////////////////////////////////////////////////////////////");
});
