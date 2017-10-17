'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const njk = require('gulp-nunjucks-render');
const sequence = require('gulp-sequence');
const watch = require('gulp-watch');
const connect = require('gulp-connect');

gulp.task('clean_dist', () => {
    return gulp.src('dist')
        .pipe(clean());
});

gulp.task('copy', () => {
    let generic = require('./generic.json');
    for (let item of generic.copyToDist) {
        gulp.src(item.src).pipe(gulp.dest(item.dest))
            .pipe(connect.reload());
    }
});

gulp.task('images', () => {
    gulp.src('images/**/*.*')
        .pipe(gulp.dest('dist'));
});

gulp.task('compile_njk', () => {
    gulp.src(['templates/static/*.njk'])
        .pipe(njk({
            path: ['./templates'],
            envOptions: { noCache: true }
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task('watch', () => {
    gulp.watch('templates/**/*.njk', ['compile_njk']);
    let generic = require('./generic.json');
    for (let item of generic.copyToDist) {
        gulp.watch(item.src, ['copy']);
    }
    // gulp.watch('generic.json', ['default', 'refresh']);
});

gulp.task('connect', function () {
    connect.server({
        // host: '192.168.1.172', //地址，可不写，不写的话，默认localhost
        port: 5000, //端口号，可不写，默认8000
        root: './dist', //当前项目主目录
        livereload: true //自动刷新
    });
});

gulp.task('default', function (cb) {
    sequence('clean_dist', ['copy', 'images', 'compile_njk'], 'connect', 'watch', cb);
});