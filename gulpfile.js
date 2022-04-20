const gulp = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const eslint = require('gulp-eslint');

const env = "./dist";

gulp.task('lint', (done) => {
  gulp.src('./src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

  done();
});

gulp.task('build', gulp.series('lint'), function (done) {
  browserify({ entries: './src/index.js', debug: true }).plugin('css-modulesify', {
    o: env + '/nftprizelocker.css'
  }).transform(babelify)
    .bundle()
    .pipe(source('nftprizelocker.bundle.js'))
    .pipe(gulp.dest(env + '/js'));

  done();
});

gulp.task('copy-manifest', function (done) {
  gulp.src('./manifest.json')
    .pipe(gulp.dest(env));

  done()
});

gulp.task('watch', function () {
  gulp.watch('./src/**/*.js', gulp.series('build'));
  gulp.watch('./src/**/*.css', gulp.series('build'));
});

gulp.task('default', gulp.series('copy-manifest', 'build'));