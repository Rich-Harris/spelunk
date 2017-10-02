import { readdir, readFile, stat } from 'fs';
import { join, relative } from 'path';
import { filterExclusions, getKey, toArray } from './shared';

export default function getDir ( root, dir, options, gotDir ) {
	const rel = relative( root, dir );

	readdir( dir, ( err, files ) => {
		if ( err ) {
			gotDir( err );
			return;
		}

		let result = {};

		const contents = filterExclusions( files, rel, options.exclude );

		if ( !contents.length ) {
			gotDir( null, result );
			return;
		}

		let keysAreNumeric = true; // assume we need to create an array, until we don't
		let remaining = contents.length;

		function check () {
			if ( !--remaining ) {
				if ( keysAreNumeric ) {
					result = toArray( result );
				}

				gotDir( null, result );
			}
		}

		contents.forEach( fileName => {
			const filePath = join( dir, fileName );
			let key;

			function gotFile ( err, data ) {
				if ( err ) {
					gotDir( err, null );
				} else if ( result[ key ] !== undefined ) {
					gotDir( 'You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath );
				} else {
					result[ key ] = data;
					check();
				}
			}

			stat( filePath, ( err, stats ) => {
				if ( err ) {
					gotDir( err, null );
					return;
				}

				if ( stats.isDirectory() ) {
					key = fileName;
					getDir( root, filePath, options, gotFile );
				} else {
					key = getKey( fileName, options );
					getFile( filePath, gotFile, options );
				}

				if ( isNaN( +key ) ) {
					keysAreNumeric = false;
				}
			});
		});
	});
}

function getFile ( filePath, gotFile, options ) {
	readFile( filePath, function ( err, result ) {
		var data;

		if ( err ) {
			gotFile( err, null );
		} else {
			data = result.toString();

			if ( options.parser ) {
				data = options.parser( filePath, data );
			} else {
				try {
					data = JSON.parse( data );
				} catch ( e ) {
					// treat as text
				}
			}

			gotFile( null, data );
		}
	});
}
