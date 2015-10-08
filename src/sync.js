import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { getKey, filterExclusions, isNumeric } from './shared';

export default function getDir ( root, dir, options ) {
	const rel = relative( root, dir );

	let files = readdirSync( dir );
	files = filterExclusions( files, rel, options.exclude );

	if ( !files.length ) return {};

	const keysAreNumeric = files.every( isNumeric );
	let result = keysAreNumeric ? [] : {};

	files.forEach( fileName => {
		const filePath = join( dir, fileName );
		const isDir = statSync( filePath ).isDirectory();

		const key = isDir ? fileName : getKey( fileName, options );

		if ( key in result ) {
			throw new Error( 'You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath );
		}

		result[ keysAreNumeric ? +key : key ] = isDir ? getDir( root, filePath, options ) : getFile( filePath );
	});

	return result;
}

function getFile ( filePath ) {
	let data = readFileSync( filePath, 'utf-8' );

	try {
		data = JSON.parse( data );
	} catch ( e ) {
		// treat as text
	}

	return data;
}
