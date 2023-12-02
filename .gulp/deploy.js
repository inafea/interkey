'use strict';

var path = require('path');
var gulp = require('gulp');
var clean = require('gulp-clean');
var gutil = require('gulp-util');
var keys = require('./.keys');
var parallelize = require("concurrent-transform");

var $ = require('gulp-load-plugins')({
  lazy: true
});


gulp.task('clean_build_folder', function () {
  console.log("Cleaning /.build folder...")
  return gulp.src('.build/**/*.*', {
      read: false
    })
    .pipe(clean());
});


gulp.task('deploy_staging', ['deploy_index_staging'], () => {

  gutil.log(gutil.colors.red("Deploying rest of the files (cached) to: " + keys.AWS_BUCKET_STAG));

  const publisher = $.awspublish.create({
    "params": {
      "Bucket": keys.AWS_BUCKET_STAG
    },
    "accessKeyId": keys.AWS_KEY_STAG,
    "secretAccessKey": keys.AWS_SECRET_STAG
  });


  return gulp.src(['.build/**/*.*', '!**/.DS_Store', '!.build/index.html'], {
      dot: true
    })
    .pipe($.awspublish.gzip())
    .pipe(parallelize(publisher.publish(null, {
      force: true
    }), 10))
    .pipe($.awspublish.reporter());
});

gulp.task('deploy_production', ['deploy_index_production'], () => {

  gutil.log(gutil.colors.red("Deploying rest of the files (cached) to: " + keys.AWS_BUCKET_PROD));

  const publisher = $.awspublish.create({
    "params": {
      "Bucket": keys.AWS_BUCKET_PROD
    },
    "accessKeyId": keys.AWS_KEY_PROD,
    "secretAccessKey": keys.AWS_SECRET_PROD
  });

  // define custom headers
  // const headers = {
  //   'Cache-Control': 'max-age=1, no-transform, public'
  // };

  return gulp.src(['.build/**/*.*', '!**/.DS_Store', '!.build/index.html'], {
      dot: true
    })
    // .pipe(publisher.publish(headers))
    // .pipe(publisher.publish(null,{force:true, createOnly:true}))
    .pipe($.awspublish.gzip())
    .pipe(parallelize(publisher.publish(null, {
      force: true
    }), 10))
    // .pipe(publisher.cache())
    .pipe($.awspublish.reporter());
});

gulp.task('deploy_index_staging', () => {

  gutil.log(gutil.colors.red("Deploying (noncached) index.html to: " + keys.AWS_BUCKET_STAG));

  const publisher = $.awspublish.create({
    "params": {
      "Bucket": keys.AWS_BUCKET_STAG
    },
    "accessKeyId": keys.AWS_KEY_STAG,
    "secretAccessKey": keys.AWS_SECRET_STAG
  });


  return gulp.src(['.build/index.html'], {
      dot: true
    })
    .pipe(publisher.publish({
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Expires': 0
		}, {
			force: true
		}))
    .pipe(publisher.sync())
    .pipe($.awspublish.reporter());
});

gulp.task('deploy_index_production', () => {

  gutil.log(gutil.colors.red("Deploying (noncached) index.html to: " + keys.AWS_BUCKET_PROD));

  const publisher = $.awspublish.create({
    "params": {
      "Bucket": keys.AWS_BUCKET_PROD
    },
    "accessKeyId": keys.AWS_KEY_PROD,
    "secretAccessKey": keys.AWS_SECRET_PROD
  });


  return gulp.src(['.build/index.html'], {
      dot: true
    })
    .pipe($.awspublish.gzip())
    .pipe(parallelize(publisher.publish(null, {
      force: true
    }), 10))
    // .pipe(publisher.cache())
    .pipe($.awspublish.reporter());
});