'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const gulpIf = require('gulp-if');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('styles', function () {
    return gulp.src('./src/styles/**/*.scss')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('common.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('js', function() {
    return gulp.src('./src/js/**/*.js')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('index.js'))
        .pipe(uglify())
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('./build/js'))
});

gulp.task('assets', function() {
    return gulp.src('src/assets/**', {since: gulp.lastRun('assets')})
        .pipe(gulp.dest('./build/'));
});

gulp.task('clean', function() {
    return del('./build/*');
});

gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'assets', 'js')));

gulp.task('watch', function() {
    gulp.watch('src/styles/**/*.scss', gulp.series('styles'));
    gulp.watch('src/assets/**/*.*', gulp.series('assets'));
    gulp.watch('src/js/**/*.js', gulp.series('js'));
});

gulp.task('server', function() {
    browserSync.init({
        server: './build'
    });

    browserSync.watch('./build/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'server')));