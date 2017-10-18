'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const njk = require('gulp-nunjucks-render');
const sequence = require('gulp-sequence');
const watch = require('gulp-watch');
const nodemon = require('gulp-nodemon');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

gulp.task('clean_dist', () => {
    return gulp.src('dist')
        .pipe(clean());
});

gulp.task('copy', () => {
    fs.readFileAsync('./gulp_config.json').then(data => {
        let generic = JSON.parse(data);
        for (let item of generic.copyToDist) {
            gulp.src(item.src)
                .pipe(gulp.dest(item.dest));
        }
    });
});

gulp.task('compile_njk', () => {
    gulp.src(['templates/static/*.njk'])
        .pipe(njk({
            path: ['./templates'],
            envOptions: {
                noCache: true
            }
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
    watch('templates/**/*.njk', { events: ['unlink'] }, function () {
        gulp.run('refresh_dist');
    });
    watch('templates/**/*.njk', { events: ['add', 'change'] }, function () {
        gulp.run('compile_njk');
    });
    watch('gulp_config.json', function () {
        gulp.run('refresh_dist');
    });
});

gulp.task('server', () => {
    nodemon({
        script: 'main.js',
        ext: 'js json',
        ignore: [
            "dist/**/*.*",
            "gulp_config.json",
            "templates/**/*.*"
        ],
        env: { 'NODE_ENV': 'development' }
    })
});

gulp.task('refresh_dist', function (cb) {
    sequence('clean_dist', ['copy', 'compile_njk'], cb);
});

gulp.task('default', function (cb) {
    sequence('clean_dist', ['copy', 'compile_njk'], 'server', 'watch', cb);
});