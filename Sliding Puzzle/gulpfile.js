var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var del = require('del');
var zip = require('gulp-zip');

var paths = {
  scripts: {
    src: 'src/*.js',
    dest: 'dist/'
  }
};
// TODO: still broken gulp task
function scripts() {
	return gulp.src([paths.scripts.src])
		.pipe(babel())
		.pipe(concat('index.js'))
		// .pipe(uglify())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(gulp.src('node_modules/**/*'))
		.pipe(gulp.dest(paths.scripts.dest+'/node_modules/'));
}

function zip_for_lambda(){
	return gulp.src([paths.scripts.dest+'/**/*'], {compress: true})
		.pipe(zip('final.zip'))
		.pipe(gulp.dest("./"));
}

function clean_dest() {
	return del([
		'dist/**/*',
	])
}

function watch() {
	gulp.watch(paths.scripts.src, ['scripts']); // list of task on script change.
}

exports.watch = watch;
// exports.scripts = scripts;
// exports.zip = zip_for_lambda;
// exports.clean = clean_dest;
gulp.task('clean', clean_dest);
gulp.task('scripts', scripts);
gulp.task('zip', zip_for_lambda);
gulp.task('default', gulp.series('clean', 'scripts', 'zip'));