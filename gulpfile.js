var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var express = require('express');
var mongoose = require('mongoose');

var plugins = gulpLoadPlugins();

var testFolder = './test';

gulp.task('default', ['bower', 'lint', 'test', 'nodemon']);

gulp.task('test', function () {
    return gulp.src(testFolder + '/*.js')
        .pipe(plugins.mocha());
});

gulp.task('bower', function () {
    return plugins.bower()
        .pipe(gulp.dest('./public/bower_components/'));
});

gulp.task('lint', function () {
    return gulp.src([
        './models/*.js',
        './public/javascript/*.js',
        './public/javascript/*/*.js',
        './routes/*.js',
        './test/*.js',
        './*.js'
    ])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

gulp.task('nodemon', function (cb) {
    var started = false;

    return plugins.nodemon({
        script: 'bin/www'
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});

module.exports = function () {
    gulp.runTask('default');
};