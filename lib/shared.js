var path = require( 'path' );
var minimatch = require( 'minimatch' );

exports.normaliseOptions = function normaliseOptions ( options ) {
	if ( !options ) {
		options = {};
	}

	// Exclude .DS_Store, Thumbs.db and any other gubbins specified by the user
	if ( !options.exclude ) {
		options.exclude = [];
	} else if ( typeof options.exclude === 'string' ) {
		options.exclude = [ options.exclude ];
	}

	options.exclude.push( '**/.DS_Store', '**/Thumbs.db', '**/.gitkeep' );

	return options;
}

exports.filterExclusions = function filterExclusions ( files, relative, exclusions ) {
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

// Get key from path, e.g. 'project/data/config.json' -> 'config'
exports.getKey = function getKey ( fileName, options ) {
	var lastDotIndex = fileName.lastIndexOf( '.' );

	if ( lastDotIndex > 0 && !options.keepExtensions ) {
		return fileName.substr( 0, lastDotIndex );
	}

	return fileName;
}

exports.toArray = function toArray ( object ) {
	var array = [], key;

	for ( key in object ) {
		if ( object.hasOwnProperty( key ) ) {
			array[ key ] = object[ key ];
		}
	}

	return array;
}

exports.isNumeric = function isNumeric ( key ) {
	return !isNaN( +key )
}