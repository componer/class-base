module.exports = {
	name: 'class-base',
	preview: {
		index: 'preview/index.html',
		script: 'preview/class-base.js',
		watchFiles: [
			'preview/index.html',
			'preview/class-base.js',
			'src/class-base.js',
		],
	},
	test: {
		entry: 'test/specs/class-base.js',
		reporters: 'test/reporters',
		debug: false,
		browsers: ['PhantomJS'],
	},
}
