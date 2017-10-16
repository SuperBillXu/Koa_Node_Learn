'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const njk = require('gulp-render-nunjucks');
const sequence = require('gulp-sequence');

gulp.task('clean', () => {
    return gulp.src('dist')
        .pipe(clean());
});

gulp.task('assets', () => {
    gulp.src(['node_modules/bootstrap/dist/css/*.min.css', 'node_modules/bootstrap/dist/css/*.min.css.map'])
        .pipe(gulp.dest('dist/assets/css'));
    gulp.src(['node_modules/bootstrap/dist/js/*.min.js', 'jquery.extension.js',
        'node_modules/jquery/dist/jquery.min.js', 'node_modules/jquery/dist/jquery.min.map'])
        .pipe(gulp.dest('dist/assets/js'));
    gulp.src(['node_modules/bootstrap/dist/fonts/*.*']).pipe(gulp.dest('dist/assets/fonts'));
    gulp.src(['node_modules/animate.css/*.min.css']).pipe(gulp.dest('dist/assets/css'));
});

gulp.task('images', () => {
    gulp.src('images/**/*.*')
        .pipe(gulp.dest('dist'));
});

gulp.task('compile_njk', () => {
    gulp.src(['templates/static/*.njk'])
        .pipe(njk.render())
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('dist'))
});

gulp.task('default', function (cb) {
    sequence('clean', ['assets', 'images', 'compile_njk'], cb);
});