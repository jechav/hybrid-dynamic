var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var connect = require('gulp-connect');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');

var paths = {
  sass: ['./src/**/**/*.scss' ],
  js: ['./src/app/**/**/*.js'],
  vendor: ['./vendor/**/*.js', './vendor.json'],
  img : ['./src/assets/img/**/**/*'],
  html: ['./public/index.html']

};

/*
 | --- SASS -----------------------------------------------
 */

gulp.task('sass', function(done) {
  gulp.src('./src/scss/main.scss')
    .on('error', function(err) { console.error(err); this.emit('end'); })
    .pipe(concat('main.css'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(autoprefixer({
      browsers: ['> 1%'],
      cascade: false
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./public/css/'))
    .pipe(connect.reload())
    .on('end', done);
});

/*
 | --- JS -------------------------------------------------
 */

gulp.task('vendor', function(done) {

  var vendorFiles = require('./vendor.json');

  gulp.src(vendorFiles)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./public/js/'))
    .pipe(connect.reload())
    .on('end', done);
});

gulp.task('js', function(done) {
  gulp.src(paths.js)
    .on('error', function(err) { console.error(err); this.emit('end'); })
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./public/js/'))
    .pipe(connect.reload())
    .on('end', done);
});

gulp.task('images', function() {
  return gulp.src(paths.img)
    .pipe(gulp.dest('./public/assets/img'));
});

gulp.task('html', function(){
  gulp.src(paths.html)
    .pipe(connect.reload());
});

gulp.task('default', ['sass', 'js', 'vendor', 'images']);

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.vendor, ['vendor']);
  gulp.watch(paths.img, ['images']);
});

gulp.task('serve', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.vendor, ['vendor']);
  gulp.watch(paths.img, {cwd: './'}, ['images']);
  gulp.watch(paths.html, ['html']);

  connect.server({
    root: 'public',
    port: 3000,
    host: 'localhost',
    livereload: true,
    fallback: 'public/index.html'
  });
});
