const ASSETS = 'assets/';
const BUILD = 'build/';
const CHROME = 'chrome/';
const CHROME_CONFIGS = CHROME + ASSETS + 'configs/';
const CHROME_CSS = CHROME + ASSETS + 'css/';
const CHROME_FONTS = CHROME + ASSETS + 'fonts/';
const CHROME_ICONS = CHROME + ASSETS + 'icons/';
const CHROME_JS = CHROME + ASSETS + 'js/';
const CHROME_MANIFEST = CHROME + 'manifest.json';
const CHROME_TEMPLATES = CHROME + ASSETS + 'templates/';
const COMMON = 'common/';
const CONFIGS = 'configs/';
const FONTS = 'fonts/';
const DIST = 'dist/';
const LIBS = 'libs/';
const SRC = 'src/';
const TEMPLATES = 'templates/';

var packagejson = require('./package.json');
var banner = ['/*',
    '    Selenium Page Object Generator - to improve agile testing process velocity.',
    '    Copyright (c) 2015, 2016 ' + packagejson.author,
    '',
    '    This program is free software: you can redistribute it and/or modify',
    '    it under the terms of the GNU Affero General Public License as',
    '    published by the Free Software Foundation, either version 3 of the',
    '    License, or (at your option) any later version.',
    '',
    '    This program is distributed in the hope that it will be useful,',
    '    but WITHOUT ANY WARRANTY; without even the implied warranty of',
    '    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the',
    '    GNU Affero General Public License for more details.',
    '',
    '    You should have received a copy of the GNU Affero General Public License',
    '    along with this program.  If not, see <http://www.gnu.org/licenses/>.',
    '*/',
    ''].join('\n');

console.time('Loading Modules');

var concat = require('gulp-concat');
var concatcss = require('gulp-concat-css');
var cssnano = require('gulp-cssnano');
var del = require('del');
var es = require('event-stream');
var gulp = require('gulp');
var header = require('gulp-header');
var htmlmin = require('gulp-htmlmin');
var istanbul = require('gulp-istanbul');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var jsonminify = require('gulp-jsonminify');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

console.timeEnd('Loading Modules');

function css(base, inputs, output) {
    return gulp.src(inputs, { base: base }).
        pipe(concatcss(output)).
        pipe(cssnano({ discardComments: { removeAllButFirst: true } })).
        pipe(header(banner)).
        pipe(gulp.dest(BUILD));
}

function html(input) {
    return gulp.src(SRC + CHROME + input).
        pipe(htmlmin({
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        })).
        pipe(gulp.dest(BUILD + CHROME));
}

function js(base, inputs, output) {
    return gulp.src(inputs, { base: base }).
        //pipe(jshint('.jshintrc')).
        //pipe(jshint.reporter('default')).
        pipe(concat(output)).
        pipe(uglify()).
        pipe(header(banner)).
        pipe(gulp.dest(BUILD));
}

gulp.task('clean', function() {
    return del([ BUILD, DIST ]);
});

gulp.task('chrome:copy', [ 'chrome:copy:configs', 'chrome:copy:folders', 'chrome:copy:manifest' ], function(cb) {
    cb();
});

gulp.task('chrome:copy:configs', function() {
    return gulp.src(CONFIGS + '**/*').
        pipe(jsonminify()).
        pipe(gulp.dest(BUILD + CHROME_CONFIGS));
});

gulp.task('chrome:copy:folders', function() {
    return es.merge(
        gulp.src(FONTS + '**/*').pipe(gulp.dest(BUILD + CHROME_FONTS)),
        gulp.src(SRC + CHROME_ICONS + '**/*').pipe(gulp.dest(BUILD + CHROME_ICONS)),
        gulp.src(TEMPLATES + '**/*').pipe(gulp.dest(BUILD + CHROME_TEMPLATES))
    );
});

gulp.task('chrome:copy:manifest', function() {
    var name = packagejson.name.replace(/-/g, ' ').replace(/\w\S*/g, function(word) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });

    return gulp.src(SRC + CHROME_MANIFEST).
        pipe(replace(/"author": "[^"]*",/g, '"author": "' + packagejson.author + '",')).
        pipe(replace(/"description": "[^"]*",/g, '"description": "' + packagejson.description + '",')).
        pipe(replace(/"name": "[^"]*",/g, '"name": "' + name + '",')).
        pipe(replace(/"version": "[^"]*"/g, '"version": "' + packagejson.version + '"')).
        pipe(jsonminify()).
        pipe(gulp.dest(BUILD + CHROME));
});

gulp.task('chrome:css', [ 'chrome:css:options', 'chrome:css:popup' ], function(cb) {
    cb();
});

gulp.task('chrome:css:options', function() {
    return css(SRC, [
            SRC + CHROME_CSS + 'options.css',
            SRC + CHROME_CSS + 'preloader.css'
        ], CHROME_CSS + 'options.css');
});

gulp.task('chrome:css:popup', function() {
    return css(SRC, [
            SRC + CHROME_CSS + 'popup.css',
            SRC + CHROME_CSS + 'preloader.css',
            SRC + CHROME_CSS + 'notify.css'
        ], CHROME_CSS + 'popup.css');
});

gulp.task('chrome:dist', function() {
    return gulp.src(BUILD + CHROME + '**/*').
        pipe(zip(packagejson.name + '-' + packagejson.version + '.zip')).
        pipe(gulp.dest(DIST));
});

gulp.task('chrome:html', [ 'chrome:html:options', 'chrome:html:popup' ], function(cb) {
    cb();
});

gulp.task('chrome:html:options', function() {
    return html('options.html');
});

gulp.task('chrome:html:popup', function() {
    return html('popup.html');
});

gulp.task('chrome:js', [ 'chrome:js:generator', 'chrome:js:options', 'chrome:js:popup' ], function(cb) {
    cb();
});

gulp.task('chrome:js:generator', function() {
    return js(SRC, [
            SRC + COMMON + 'common.js',
            SRC + COMMON + 'generator.js'
        ], CHROME_JS + 'generator.js');
});

gulp.task('chrome:js:options', function() {
    return js(SRC, [
            LIBS + 'jquery-2.1.4.js',
            SRC + CHROME_JS + 'preloader.js',
            SRC + COMMON + 'common.js',
            SRC + CHROME_JS + 'options.js'
        ], CHROME_JS + 'options.js');
});

gulp.task('chrome:js:popup', function() {
    return js(SRC, [
            LIBS + 'jquery-2.1.4.js',
            LIBS + 'handlebars-v3.0.3.js',
            SRC + CHROME_JS + 'preloader.js',
            SRC + CHROME_JS + 'notify.js',
            SRC + CHROME_JS + 'social.js',
            SRC + COMMON + 'common.js',
            SRC + COMMON + 'helpers.js',
            SRC + CHROME_JS + 'popup.js'
        ], CHROME_JS + 'popup.js');
});

gulp.task('chrome:js:lint', function() {
    return gulp.src(SRC + CHROME_JS + '*.js', { base: SRC }).
        pipe(jshint()).
        //pipe(jshint('.jshintrc')).
        pipe(jshint.reporter('default'));
});

gulp.task('chrome:js:test', function(cb) {
    gulp.src(SRC + CHROME_JS + '*.js', { base: SRC }).
        pipe(istanbul({ includeUntested: true })).
        pipe(istanbul.hookRequire()).
        on('finish', function() {
            gulp.src('specs/chrome/*-spec.js').
                pipe(jasmine({ includeStackTrace: true, verbose: true })).
                pipe(istanbul.writeReports({
                    dir: 'lcov/chrome',
                    reporters: [ 'lcov' ],
                    reportOpts: { dir: 'lcov/chrome' }
                })).
                on('end', cb);
        });
});

gulp.task('chrome', [ 'chrome:copy', 'chrome:css', 'chrome:html', 'chrome:js' ], function(cb) {
    gulp.start('chrome:dist');
    cb();
});

gulp.task('common:test', function(cb) {
    gulp.src(SRC + COMMON + '*.js', { base: SRC }).
        pipe(istanbul({ includeUntested: true })).
        pipe(istanbul.hookRequire()).
        on('finish', function() {
            gulp.src('specs/common/*-spec.js').
                pipe(jasmine({ includeStackTrace: true, verbose: true })).
                pipe(istanbul.writeReports({
                    dir: 'lcov/common',
                    reporters: [ 'lcov' ],
                    reportOpts: { dir: 'lcov/common' }
                })).
                on('end', cb);
        });
});

//gulp.task('watch', function() {
//});

gulp.task('default', [ 'clean' ], function(cb) {
    // wait until clean task is completed
    gulp.start('chrome');
    cb();
});
