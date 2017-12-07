const path = require( 'path' );

module.exports = {
	parser: ( filePath, data ) => {
		switch ( path.extname( filePath ) ) {
			case '.txt':
				return data.trim().split( '||' );
			case '.csv':
				return data.trim().split( ',' );
			default:
				return data;
		}
	}
};
