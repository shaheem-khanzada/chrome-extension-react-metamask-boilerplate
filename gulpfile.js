// // Gulp Dependencies
const gulp = require('gulp');
// Build Dependencies
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');


const env = "./dist";

gulp.task('build', function (done) {
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


gulp.task('default', gulp.series('copy-manifest', 'build', 'watch'));
