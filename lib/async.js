var fs = require( 'fs' );
var path = require( 'path' );
var shared = require( './shared' );

module.exports = getDir;

function getDir ( root, dir, options, gotDir ) {
	var relative = path.relative( root, dir );

	fs.readdir( dir, function ( err, files ) {
		var contents, result, remaining, check, keysAreNumeric;

		if ( err ) {
			gotDir( err );
			return;
		}

		result = {};

		contents = shared.filterExclusions( files, relative, options.exclude );
		if ( !contents.length ) {
			gotDir( null, result );
			return;
		}

		keysAreNumeric = true; // assume we need to create an array, until we don't

		remaining = contents.length;

		check = function () {
			if ( !--remaining ) {
				if ( keysAreNumeric ) {
					result = shared.toArray( result );
				}

				gotDir( null, result );
			}
		};

		contents.forEach( function ( fileName ) {
			var filePath, key, gotFile;

			filePath = path.join( dir, fileName );

			gotFile = function ( err, data ) {
				if ( err ) {
					gotDir( err, null );
				} else if ( result[ key ] !== undefined ) {
					gotDir( 'You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath );
				} else {
					result[ key ] = data;
					check();
				}
			};

			fs.stat( filePath, function ( err, stats ) {

				if ( err ) {
					gotDir( err, null );
					return;
				}

				if ( stats.isDirectory() ) {
					key = fileName;
					getDir( root, filePath, options, gotFile );
				} else {
					key = shared.getKey( fileName, options );
					getFile( filePath, gotFile );
				}

				if ( isNaN( +key ) ) {
					keysAreNumeric = false;
				}
			});
		});
	});
}

function getFile ( filePath, gotFile ) {
	fs.readFile( filePath, function ( err, result ) {
		var data;

		if ( err ) {
			gotFile( err, null );
		} else {
			data = result.toString();

			try {
				data = JSON.parse( data );
			} catch ( e ) {}

			gotFile( null, data );
		}
	});
}