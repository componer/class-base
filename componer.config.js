var bowerJson = require('./bower.json')
var deps = Object.keys(bowerJson.dependencies)
var externals = {}
if(deps.length > 0) deps.forEach(dep => externals[dep] = dep)

module.exports = {
	name: 'class-base',
	type: 'bower',
	build: [
		{
			from: 'src/class-base.js',
			to: 'dist/class-base.js',
			driver: 'webpack',
			options: {
				minify: true,
				sourcemap: 'file',
			},
			settings: {
				output: {
					library: 'class-base',
				},
				externals: externals,
			},
		},
	],
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
