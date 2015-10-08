import { resolve } from 'path';
import promise from 'es6-promise';

import sync from './sync';
import async from './async';
import { normaliseOptions } from './shared';

const { Promise } = promise;

export default function spelunk ( root, options, callback ) {
	const promise = new Promise( ( fulfil, reject ) => {
		if ( typeof options === 'function' ) {
			callback = options;
			options = {};
		}

		options = normaliseOptions( options );
		root = resolve( root );

		// Get the specified folder, then done
		async( root, root, options, ( err, result ) => {
			if ( err ) return reject( err );
			fulfil( result );
		});
	});

	if ( callback ) {
		promise
			.then( result => callback( null, result ) )
			.catch( callback );
	}

	return promise;
}

spelunk.sync = function ( root, options ) {
	root = resolve( root );
	return sync( root, root, normaliseOptions( options ) );
};
