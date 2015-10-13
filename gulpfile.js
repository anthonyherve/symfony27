var gulp = require('gulp');
var rename = require('gulp-rename');

gulp.task('default', function () {});

var libPath = '/app/Resources/lib/';

// Create task to compile scaa files to css
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
gulp.task('sass', function () {
    gulp.src('./web/bundles/common/sass/main.scss')
        .pipe(sass({sourceComments: 'map', errLogToConsole: true}))
        .pipe(rename('main.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./web/css/'));
});


// Create task to copy fonts to web/fonts
var copy = copy = require('gulp-copy');
gulp.task('fonts', function () {
    return gulp.src('.' + libPath + 'bootstrap-sass/assets/fonts/bootstrap/*')
        .pipe(copy('./web/fonts', {prefix: 7}));
});

gulp.task('img', function () {
    return gulp.src(['./web/bundles/*/img/**/*','./web/bundles/*/imgs/**/*','./web/bundles/*/images/**/*'])
        .pipe(copy('./web/img', {prefix: 7}));
});


// Create task to copy js on web/js
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
gulp.task('js', function() {
    gulp.src([
        './web/bundles/*/js/**/*.js',
        '.' + libPath + 'bootstrap-sass/assets/javascripts/bootstrap.min.js',
        '.' + libPath + 'jquery/dist/jquery.min.js'
    ])
        //.pipe(concat('main.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('./web/js'));
});


// Create task to launch phpunit
var phpunit = require('gulp-phpunit');
gulp.task('test', function () {
    return gulp.src('./src/*/Tests/**/*.php')
        .pipe(phpunit('./bin/phpunit', {debug: false, configurationFile: './app/phpunit.xml'}));
});


// Create task to coverage unit tests
gulp.task('coverage', function () {
    return gulp.src('./src/*/Tests/**/*.php')
        .pipe(phpunit(
            './bin/phpunit',
            {debug: false, configurationFile: './app/phpunit.xml', coverageHtml: './web/build/coverage'}
        ));
});


// Create task to sniff code
var phpcs = require('gulp-phpcs');
gulp.task('checkstyle', function () {
    return gulp.src(['src/**/*.php'])
        .pipe(phpcs({bin: './bin/phpcs', standard: 'PSR2', warningSeverity: 0}))
        .pipe(phpcs.reporter('log'));
});


// Create task to coverage and checkstyle
gulp.task('verify', ['coverage', 'checkstyle']);


// Create task to launch Symfony command
var exec = require('child_process').exec;
gulp.task('installAssets', function () {
    exec('php app/console assets:install --symlink', logStdOutAndErr);
});


gulp.task('compile-sass', ['installAssets', 'sass']);
gulp.task('compile-js', ['installAssets', 'js']);
// Create task to watch changes on js and scss
gulp.task('watch', function () {
    var onChange = function (event) {
        console.log('File '+event.path+' has been '+event.type);
    };
    gulp.watch('./src/*/Resources/public/sass/**/*.scss', ['compile-sass'])
        .on('change', onChange);
    gulp.watch('./src/*/Resources/public/js/**/*.js', ['compile-js'])
        .on('change', onChange);
});


// Without this function exec() will not show any output
var logStdOutAndErr = function (err, stdout, stderr) {
    console.log(stdout + stderr);
};
