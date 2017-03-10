module.exports = {
	name: 'class-base',
	type: 'bower',
	// build: [], // remove build task
	preview: {
		index: 'preview/index.html',
		script: 'preview/class-base.js',
		watchFiles: [
			'preview/index.html',
			'preview/class-base.js',
			'preview/class-base.scss',
			'src/**/*',
		],
	},
	test: {
		entry: 'test/specs/class-base.js',
		reporters: 'test/reporters',
		debug: false,
		browsers: ['PhantomJS'],
	},
}
