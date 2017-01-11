var hbsp = require("hbsp");
var path = require("path");
var concat = require('gulp-concat');
var gulp = require("gulp");
var del = require("del");
var fs = require("fs-extra");
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var ext_replace = require('gulp-ext-replace');

var hbsPrecompile = hbsp.precompile;

var webappDir = "";

// --------- postcss require --------- //
var postcss = require('gulp-postcss');
var cssImport = require('postcss-import'); // to allow mixin imports
var postcssMixins = require("postcss-mixins");
var postcssSimpleVars = require("postcss-simple-vars");
var postcssNested = require("postcss-nested");
var cssnext = require('postcss-cssnext');

var processors = [
	cssImport,
	postcssMixins,
	postcssSimpleVars,
	postcssNested,
	cssnext({ browsers: ['last 2 versions'] })
];
// --------- /postcss require --------- //

var jsDir = path.join(webappDir,"web/js/");
var cssDir = path.join(webappDir,"web/css/");

gulp.task('default',['clean', 'pcss', 'tmpl', 'lib-bundle', 'app-bundle']);

// --------- Web Assets Processing --------- //
gulp.task('watch', ['default'], function(){

	// Watch the lib-bundle and app-bundle
	gulp.watch(path.join(webappDir,"src/js-lib/*.js"), ['lib-bundle']);
	gulp.watch(path.join(webappDir,"src/js-app/*.js"), ['app-bundle']);

	// for the common pcss app
	gulp.watch(path.join(webappDir,"src/pcss/*.pcss"), ['pcss']);

	gulp.watch(path.join(webappDir,"src/view/*.tmpl"), ['tmpl']);
	gulp.watch(path.join(webappDir,"src/view/*.pcss"), ['pcss']);
	gulp.watch(path.join(webappDir,"src/view/*.js"), ['app-bundle']);
	//gulp.watch(path.join(webappDir,"src/view/*.tmpl"), ['app-bundle']);
});


gulp.task('clean', function(){
	var dirs = [cssDir, jsDir];
	
	var dir;
	for (var i = 0; i < dirs.length ; i ++){
		dir = dirs[i];
		// make sure the directories exists (they might not in fresh clone)
		if (!fs.existsSync(dir)) {
			fs.mkdir(dir);
		}
		// delete the .css and .js files (this makes sure we do not )
		del.sync(dir + "*.css");
		del.sync(dir + "*.js");
		del.sync(dir + "*.map");
	}
});

gulp.task('tmpl', function() {
	gulp.src(path.join(webappDir,"src/view/*.tmpl"))
		.pipe(hbsPrecompile())
		.pipe(concat("templates.js"))
		.pipe(gulp.dest(jsDir));
});


gulp.task('pcss', function() {
	gulp.src([path.join(webappDir,"src/pcss/*.pcss"),path.join(webappDir,"src/view/*.pcss")])
		.pipe(sourcemaps.init())
		.pipe(postcss(processors))
		.pipe(concat('all-bundle.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(cssDir));
});


// lib bundle is the javascripts libs code that are used in the app
gulp.task('lib-bundle', function() {
	var files = listFiles("src/js-lib/", ".js");
	return browserify({entries: files, debug: true})
		.bundle()
		.pipe(source('lib-bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))	
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(jsDir));
});

// app bundle is the javascripts view js and application common code that are used in the app
gulp.task('app-bundle', function() {
	var files = listFiles(["src/js-app/","src/view/"], ".js"); 
	return browserify({entries: files, debug: true})
		.bundle()
		.pipe(source('app-bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))	
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(jsDir));
});
// --------- /Web Assets Processing --------- //


// --------- utils --------- //
function listFiles(dirs, ending){
	var files = [];
	// make it an array
	dirs = (dirs instanceof Array)?dirs:[dirs];

	for (let dir of dirs){
		for (let f of fs.readdirSync(dir)){
			if (f.toString().endsWith(ending)){
				files.push(path.join(dir,f));
			}
		}
	}

	return files;
}
// --------- /utils --------- //