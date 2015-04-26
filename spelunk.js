var fs = require( 'graceful-fs' );
var path = require( 'path' );
var minimatch = require( 'minimatch' );
var Promise = require( 'es6-promise' ).Promise;

var sync = require( './lib/sync' );
var async = require( './lib/async' );
var shared = require( './lib/shared' );

module.exports = spelunk;

function spelunk ( root, options, done ) {
	var promise = new Promise( function ( fulfil, reject ) {
		if ( typeof options === 'function' ) {
			done = options;
			options = {};
		}

		options = shared.normaliseOptions( options );

		root = path.resolve( root );

		// Get the specified folder, then done
		async( root, root, options, function ( err, result ) {
			if ( err ) {
				return reject( err );
			}

			fulfil( result );
		});
	});

	if ( done ) {
		promise.then( function ( result ) {
			done( null, result );
		}).catch( done );
	}

	return promise;
};

spelunk.sync = function ( root, options ) {
	root = path.resolve( root );
	return sync( root, root, shared.normaliseOptions( options ) );
};
