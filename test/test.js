require( 'source-map-support' ).install();
require( 'console-group' ).install();

var spelunk = require( '..' );
var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );

var TESTS = path.resolve( __dirname, 'tests' );

describe( 'spelunk', function () {
	var filtered = [];

	var tests = fs.readdirSync( TESTS ).map( function ( id ) {
		var test = {
			id: id,
			options: require( path.join( TESTS, id, 'config.js' ) ),
			expected: require( path.resolve( TESTS, id, 'expected.json' ) )
		};

		if ( test.options.solo ) filtered.push( test );
		return test;
	});

	if ( filtered.length ) tests = filtered;

	describe( 'sync', function () {
		tests.forEach( function ( test ) {
			it( test.id, function () {
				var actual = spelunk.sync( path.join( TESTS, test.id, 'files' ), test.options );
				assert.deepEqual( actual, test.expected );
			});
		});
	});

	describe( 'async', function () {
		tests.forEach( function ( test ) {
			( test.solo ? it.only : it )( test.id, function () {
				return spelunk( path.resolve( TESTS, test.id, 'files' ), test.options ).then( function ( actual ) {
					assert.deepEqual( actual, test.expected );
				});
			});
		});
	});
});
