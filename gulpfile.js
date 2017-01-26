// Documentation
// https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
// https://github.com/gulpjs/gulp/blob/master/docs/API.md
// https://zellwk.com/blog/nunjucks-with-gulp/
// http://gulpjs.com/

'use strict';

var gulp = require('gulp');
var del = require('del');
var nunjucksRender = require('gulp-nunjucks-render');
var prettify = require('gulp-jsbeautifier');
var data = require('gulp-data');

// Delete the dist folder
gulp.task('delete-dist', function() {
  return del(['dist']);
});

// Copy over the files in the public folder "as they are" to the dist folder
gulp.task('copy-public', ['delete-dist'], function() {
  return gulp.src('src/public/**/*')
    .pipe(gulp.dest('dist/'));
});

// Compile all HTML pages
gulp.task('compile-html', ['delete-dist'], function() {
  return gulp.src('src/templates/pages/**/*.+(html|nunjucks)')
    .pipe(data(function() {
      return require('./src/data/partners.json')
    }))
    .pipe(nunjucksRender({ path: ['src/templates'] }))
    .pipe(prettify({ config: './prettify.json' }))
    .pipe(gulp.dest('dist'))
});
