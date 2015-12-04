var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var bower = require('gulp-bower');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var express = require('express');

var plugins = gulpLoadPlugins();

var testFolder = './test';

gulp.task('default', ['bower', 'nodemon']);

gulp.task('test', function () {
    return gulp.src(testFolder + '/*.js')
        .pipe(plugins.mocha());
});

gulp.task('bower', function () {
    return bower()
        .pipe(gulp.dest('./public/bower_components/'));
});

gulp.task('nodemon', function (cb) {
    var started = false;

    return nodemon({
        script: 'bin/www'
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});