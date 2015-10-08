import { join } from 'path';
import minimatch from 'minimatch';

export function normaliseOptions ( options = {} ) {
	// Exclude .DS_Store, Thumbs.db and any other gubbins specified by the user
	if ( !options.exclude ) {
		options.exclude = [];
	} else if ( typeof options.exclude === 'string' ) {
		options.exclude = [ options.exclude ];
	}

	options.exclude.push( '**/.DS_Store', '**/Thumbs.db', '**/.gitkeep' );
	return options;
}

export function filterExclusions ( files, relative, exclusions ) {
	if ( !exclusions ) return files;

	return files.filter( fileName => {
		const filePath = join( relative, fileName );

		let i = exclusions.length;
		while ( i-- ) {
			if ( minimatch( filePath, exclusions[i] ) ) return false;
		}

		return true;
	});
}

// Get key from path, e.g. 'project/data/config.json' -> 'config'
export function getKey ( fileName, options ) {
	var lastDotIndex = fileName.lastIndexOf( '.' );

	if ( lastDotIndex > 0 && !options.keepExtensions ) {
		return fileName.substr( 0, lastDotIndex );
	}

	return fileName;
}

export function toArray ( object ) {
	var array = [], key;

	for ( key in object ) {
		if ( object.hasOwnProperty( key ) ) {
			array[ key ] = object[ key ];
		}
	}

	return array;
}

export function isNumeric ( key ) {
	return !isNaN( +key );
}
