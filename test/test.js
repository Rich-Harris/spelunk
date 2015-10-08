require( 'source-map-support' ).install();

var spelunk = require( '..' );
var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );

var TESTS = path.resolve( __dirname, 'tests' );

describe( 'spelunk', function () {
	var tests = fs.readdirSync( TESTS ).map( function ( id ) {
		return {
			id: id,
			options: require( path.join( TESTS, id, 'config.js' ) ),
			expected: require( path.resolve( TESTS, id, 'expected.json' ) )
		};
	});

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
			it( test.id, function () {
				return spelunk( path.resolve( TESTS, test.id, 'files' ), test.options ).then( function ( actual ) {
					assert.deepEqual( actual, test.expected );
				});
			});
		});
	});
});
