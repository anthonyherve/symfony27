var gulp = require('gulp-param')(require('gulp'), process.argv);
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');

gulp.task('default', function () {
});

var libPath = '/app/Resources/lib/';

// Create task to compile scss files to css
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
gulp.task('compile-sass', function (env) {
    if (env == 'prod') {
        gulp.src('./web/bundles/common/sass/main.scss')
            .pipe(plumber({errorHandler: onError}))
            .pipe(sass({errLogToConsole: true}))
            .pipe(rename('main.css'))
            .pipe(minifyCss({rebase: false}))
            .pipe(gulp.dest('./web/css/'));
    } else {
        gulp.src('./web/bundles/common/sass/main.scss')
            .pipe(plumber({errorHandler: onError}))
            .pipe(sass({errLogToConsole: true}))
            .pipe(rename('main.css'))
            .pipe(gulp.dest('./web/css/'));
    }
});


// Create task to copy fonts to web/fonts
var copy = copy = require('gulp-copy');
gulp.task('fonts', function () {
    gulp.src(['./web/bundles/*/fonts/**/*']).pipe(copy('./web/fonts', {prefix: 4}));
    return gulp.src('.' + libPath + 'bootstrap-sass/assets/fonts/bootstrap/*')
        .pipe(copy('./web/fonts', {prefix: 6}));
});

gulp.task('img', function () {
    return gulp.src(['./web/bundles/*/img/**/*', './web/bundles/*/imgs/**/*', './web/bundles/*/images/**/*'])
        .pipe(copy('./web/img', {prefix: 4}));
});


// Create task to copy js on web/js
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
gulp.task('compile-js', function (env) {
    if (env == 'prod') {
        gulp.src([
                './web/bundles/*/js/**/*.js',
                '.' + libPath + 'bootstrap-sass/assets/javascripts/bootstrap.min.js',
                '.' + libPath + 'jquery/dist/jquery.min.js'
            ])
            .pipe(concat('main.js'))
            .pipe(uglify())
            .pipe(gulp.dest('./web/js'));
    } else {
        gulp.src([
                './web/bundles/*/js/**/*.js',
                '.' + libPath + 'bootstrap-sass/assets/javascripts/bootstrap.min.js',
                '.' + libPath + 'jquery/dist/jquery.min.js'
            ])
            .pipe(gulp.dest('./web/js'));
    }
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
            {debug: true, configurationFile: './app/phpunit.xml', coverageHtml: './web/build/coverage'}
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


gulp.task('sass', ['installAssets', 'compile-sass']);
gulp.task('js', ['installAssets', 'compile-js']);
// Create task to watch changes on js and scss
gulp.task('watch', function () {
    var onChange = function (event) {
        console.log('File ' + event.path + ' has been ' + event.type);
    };
    // Install assets when adding or deleting a file
    gulp.watch('./src/**/Resources/public/**/*', ['installAssets'])
        .on('add', onChange);
    gulp.watch('./src/**/Resources/public/**/*', ['installAssets'])
        .on('unlink', onChange);
    // Compile SASS when changing scss files
    gulp.watch('./src/**/Resources/public/sass/**/*.scss', ['sass'])
        .on('change', onChange);
    // Compile JS when changing js files
    gulp.watch('./src/**/Resources/public/js/**/*.js', ['compile-js'])
        .on('change', onChange);
});


// Without this function exec() will not show any output
var logStdOutAndErr = function (err, stdout, stderr) {
    console.log(stdout + stderr);
};

var onError = function (err) {
    console.log(err);
};
