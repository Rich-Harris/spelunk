var gobble = require( 'gobble' );

module.exports = gobble( 'src' ).transform( 'rollup-babel', {
	entry: 'spelunk.js',
	format: 'cjs',
	external: [ 'fs', 'path', 'minimatch', 'es6-promise' ]
});
