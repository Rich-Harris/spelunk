var fs, path, minimatch;

fs = require( 'graceful-fs' );
path = require( 'path' );
minimatch = require( 'minimatch' );
Promise = require( 'es6-promise' ).Promise;

module.exports = function ( root, options, done ) {
	var promise = new Promise( function ( fulfil, reject ) {
		if ( typeof options === 'function' ) {
			done = options;
			options = {};
		} else {
			options = options || {};
		}

		// If root has a trailing slash, remove it
		if ( root.substr( -1 ) === path.sep ) {
			root = root.substr( 0, root.length - 1 );
		}

		// Exclude .DS_Store, Thumbs.db and any other gubbins specified by the user
		if ( !options.exclude ) {
			options.exclude = [];
		} else if ( typeof options.exclude === 'string' ) {
			options.exclude = [ options.exclude ];
		}

		options.exclude.push( '**/*/.DS_Store', '**/*/Thumbs.db' );

		root = path.resolve( root );

		// Get the specified folder, then done
		getDir( '', root, options, function ( err, result ) {
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


function getDir ( root, dir, options, gotDir ) {
	var relative = path.relative( root, dir );

	fs.readdir( dir, function ( err, files ) {
		var contents, result, remaining, check, keysAreNumeric;

		if ( err ) {
			gotDir( err );
			return;
		}

		result = {};

		contents = filterExclusions( files, relative, options.exclude );
		if ( !contents.length ) {
			gotDir( null, result );
			return;
		}

		keysAreNumeric = true; // assume we need to create an array, until we don't

		remaining = contents.length;

		check = function () {
			if ( !--remaining ) {
				if ( keysAreNumeric ) {
					result = toArray( result );
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
					key = getKey( fileName, options );
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


// Get key from path, e.g. 'project/data/config.json' -> 'config'
function getKey ( fileName, options ) {
	var lastDotIndex = fileName.lastIndexOf( '.' );

	if ( lastDotIndex > 0 && !options.keepExtensions ) {
		return fileName.substr( 0, lastDotIndex );
	}

	return fileName;
}


function toArray ( object ) {
	var array = [], key;

	for ( key in object ) {
		if ( object.hasOwnProperty( key ) ) {
			array[ +key ] = object[ key ];
		}
	}

	return array;
}


function filterExclusions ( files, relative, exclusions ) {
	if ( !exclusions ) {
		return files;
	}

	return files.filter( function ( fileName ) {
		var filePath, i;

		filePath = path.join( relative, fileName );

		i = exclusions.length;
		while ( i-- ) {
			if ( minimatch( filePath, exclusions[i] ) ) {
				return false;
			}
		}

		return true;
	});
}
