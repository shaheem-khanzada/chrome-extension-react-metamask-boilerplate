const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const open = require('open');
const source = require('vinyl-source-stream');
const gulpESLintNew = require('gulp-eslint-new');
const connect = require('gulp-connect');

var config = {
  name: 'Nft Prize Locker',
  root: 'dist',
  port: 8080,
  devBaseUrl: 'http://localhost',
}

gulp.task('lint', function () {
  return gulp.src('./src/**/*.js')
    .pipe(gulpESLintNew())
    .pipe(gulpESLintNew.format())
    .pipe(gulpESLintNew.failAfterError());
});

gulp.task('build', function (done) {
  browserify({ entries: './src/index.js', debug: true }).plugin('css-modulesify', {
    o: config.root + '/nftprizelocker.css'
  }).transform(babelify)
    .bundle()
    .pipe(source('nftprizelocker.bundle.js'))
    .pipe(gulp.dest(config.root + '/js'))
    .pipe(connect.reload());

  done();
});

gulp.task('copy-manifest', function (done) {
  gulp.src('./manifest.json')
    .pipe(gulp.dest(config.root));

  done()
});

gulp.task('connect', function (done) {
  connect.server({
    name: 'Nft Prize Locker',
    root: 'dist',
    port: config.port,
    devBaseUrl: config.devBaseUrl,
    livereload: true
  });

  open(`${config.devBaseUrl}:${config.port}`)

  done();
});

gulp.task('watch', function () {
  gulp.watch('./src/**/*.js', gulp.series('lint', 'build'));
  gulp.watch('./src/**/*.css', gulp.series('build'));
});

gulp.task('default', gulp.series('copy-manifest', 'build'));