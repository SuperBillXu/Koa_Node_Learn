'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const njk = require('gulp-nunjucks-render');
const sequence = require('gulp-sequence');
const nodemon = require('gulp-nodemon');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const del = require('del');
const process = Promise.promisifyAll(require('child_process'));

gulp.task('clean_dist', () => {
    return del(['dist/*']);
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
    gulp.src(['templates/static/**/*.njk'])
        .pipe(njk({
            path: ['./templates'],
            envOptions: {
                noCache: true
            }
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('dist'));
});

gulp.task('server', () => {
    nodemon({
        script: 'main.js',
        ext: 'js json njk',
        exitcrash: true,
        verbose: true,
        ignore: [
            "dist/**/*",
            "node_modules/**/*",
            ".git",
            ".gitignore"
        ],
        tasks: ['refresh_dist'],
        env: { 'NODE_ENV': 'development' }
    });
});

gulp.task('refresh_dist', function (cb) {
    sequence('clean_dist', ['copy', 'compile_njk'], cb);
});

gulp.task('default', function (cb) {
    sequence('clean_dist', ['copy', 'compile_njk'], 'server', cb);
});