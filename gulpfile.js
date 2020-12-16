const {src, dest, series, parallel, watch, task} = require('gulp'),
	 path = 		require('path')
	 sass = 		require('gulp-sass'),
	 cleanCSS = 	require('gulp-clean-css'),
	 rename = 	require('gulp-rename'),
	 browserSync = require('browser-sync'),
	 concat = 	require('gulp-concat'),
	 uglify = 	require('gulp-uglify-es').default
	 htmlmin = 	require('gulp-htmlmin'),
	 imagemin = require('gulp-imagemin'),
	 autoprefixer = require('gulp-autoprefixer');

const absDirs = {
	dev: path.relative(process.cwd(), path.join(__dirname, 'src')) + '/',
	prod: path.relative(process.cwd(), path.join(__dirname, 'dist')) + '/'
}

const globStyles = [absDirs.dev + 'scss/**/*.scss', absDirs.dev + 'sass/**/*.sass'],
	uncomprScripts = [absDirs.dev + 'js/**/*.js', '!' + absDirs.dev + 'js/**/*.min.js']

/*console.log(process.cwd())
console.log(__dirname)
console.log(absDirs)*/

task('styles', () => {
	return src(globStyles, {sourcemaps: true})
	.pipe(sass())
	.pipe(autoprefixer({cascade: false}))
	.pipe(cleanCSS({debug: true}, details => {
		console.log(`${details.name}: ${details.stats.originalSize}`)
		console.log(`${details.name}: ${details.stats.minifiedSize}`)
	}))
	.pipe(rename({suffix: '.min'}))
	.pipe(dest(absDirs.prod+'css'))
	.pipe(browserSync.stream())
})
task('scripts', () => {
	return src(uncomprScripts)
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(dest(absDirs.prod+'js'))
	.pipe(browserSync.stream())
})
task('libsCSS', () => {
	return src([absDirs.dev+'/libs/bootstrap/css/bootstrap.min.css'])
	.pipe(concat('libs.min.css'))
	.pipe(cleanCSS())
	.pipe(dest(absDirs.prod + 'css'))
})
task('libsJS', () => {
	return src([absDirs.dev+'libs/jquery/jquery.min.js'])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(dest(absDirs.prod + 'js'))
})
task('minhtml', () => {
	return src(absDirs.dev + '*.html')
	.pipe(htmlmin({
		collapseWhitespace: true,
		caseSensitive: true,
		collapseBooleanAttributes: true,
		minifyCSS: true, minifyJS: true,
		preventAttributesEscaping: true,
		processConditionalComments: true,
		removeAttributeQuotes: true,
		removeEmptyAttributes: true,
		removeComments: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		useShortDoctype: true
	}))
	.pipe(dest(absDirs.prod))
})
task('fonts', () => {
	return src(absDirs.dev+'fonts/**/*.*')
	.pipe(dest(absDirs.prod+'fonts'))
})
task('imagemin', done => {
    
	//[jpg] ---to---> [jpg(jpegtran)]
	return src(absDirs.dev + 'img/**/*.*').pipe(imagemin([
		// imagemin.gifsicle({interlaced: true}),
		imagemin.mozjpeg({quality: 30, progressive: true}),
		imagemin.optipng({optimizationLevel: 6}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: true},
				{cleanupIDs: false}
			]
		})
	])).pipe(dest(absDirs.prod + 'img/'))

});

task('compile', parallel('styles', 'scripts'))
task('materials', parallel('minhtml', 'imagemin', 'fonts'))
task('libs', parallel('libsCSS', 'libsJS'))
task('build', parallel('libs', 'compile', 'materials'))
task('server', () => {
	browserSync.init({
		server: {baseDir: absDirs.prod}
	})
})

task('watch', () => {
	watch(globStyles, series('styles'))
	watch(uncomprScripts, series('scripts'))
	watch(absDirs.dev+'*.html').on('change', series('minhtml', () => {
		browserSync.reload()
	}))
})

task('default', series('build', parallel('server', 'watch')))