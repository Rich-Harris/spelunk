var fs = require( 'fs' );
var path = require( 'path' );
var shared = require( './shared' );

module.exports = getDir;

function getDir ( root, dir, options ) {
	var relative = path.relative( root, dir );
	var files = fs.readdirSync( dir );

	files = shared.filterExclusions( files, relative, options.exclude )

	if ( !files.length ) return {};

	var result = files.every( shared.isNumeric ) ? [] : {};

	files.forEach( function ( fileName ) {
		var filePath = path.join( dir, fileName );
		var isDir = fs.statSync( filePath ).isDirectory();

		var key = isDir ? fileName : shared.getKey( fileName, options );

		if ( key in result ) {
			throw new Error( 'You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath );
		}

		result[ key ] = isDir ? getDir( root, filePath, options ) : getFile( filePath );
	});

	return result;
}

function getFile ( filePath ) {
	var data = fs.readFileSync( filePath, 'utf-8' );

	try {
		data = JSON.parse( data );
	} catch ( e ) {}

	return data;
}