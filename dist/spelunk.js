'use strict';

var path = require('path');
var promise = require('es6-promise');
promise = 'default' in promise ? promise['default'] : promise;
var fs = require('fs');
var minimatch = require('minimatch');
minimatch = 'default' in minimatch ? minimatch['default'] : minimatch;

function normaliseOptions() {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	// Exclude .DS_Store, Thumbs.db and any other gubbins specified by the user
	if (!options.exclude) {
		options.exclude = [];
	} else if (typeof options.exclude === 'string') {
		options.exclude = [options.exclude];
	}

	options.exclude.push('**/.DS_Store', '**/Thumbs.db', '**/.gitkeep');
	return options;
}

function filterExclusions(files, relative, exclusions) {
	if (!exclusions) return files;

	return files.filter(function (fileName) {
		var filePath = path.join(relative, fileName);

		var i = exclusions.length;
		while (i--) {
			if (minimatch(filePath, exclusions[i])) return false;
		}

		return true;
	});
}

// Get key from path, e.g. 'project/data/config.json' -> 'config'

function getKey(fileName, options) {
	var lastDotIndex = fileName.lastIndexOf('.');

	if (lastDotIndex > 0 && !options.keepExtensions) {
		return fileName.substr(0, lastDotIndex);
	}

	return fileName;
}

function toArray(object) {
	var array = [],
	    key;

	for (key in object) {
		if (object.hasOwnProperty(key)) {
			array[+key] = object[key];
		}
	}

	return array;
}

function isNumeric(key) {
	return !isNaN(+key);
}

function getDir(root, dir, options) {
	var rel = path.relative(root, dir);

	var files = fs.readdirSync(dir);
	files = filterExclusions(files, rel, options.exclude);

	if (!files.length) return {};

	var keysAreNumeric = files.every(isNumeric);
	var result = keysAreNumeric ? [] : {};

	files.forEach(function (fileName) {
		var filePath = path.join(dir, fileName);
		var isDir = fs.statSync(filePath).isDirectory();

		var key = isDir ? fileName : getKey(fileName, options);

		if (key in result) {
			throw new Error('You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath);
		}

		result[keysAreNumeric ? +key : key] = isDir ? getDir(root, filePath, options) : getFile(filePath, options);
	});

	return result;
}

function getFile(filePath, options) {
	var data = fs.readFileSync(filePath, 'utf-8');

	if (options.parser) {
		data = options.parser(filePath, data);
	} else {
		try {
			data = JSON.parse(data);
		} catch (e) {
			// treat as text
		}
	}

	return data;
}

function getDir$1(root, dir, options, gotDir) {
	var rel = path.relative(root, dir);

	fs.readdir(dir, function (err, files) {
		if (err) {
			gotDir(err);
			return;
		}

		var result = {};

		var contents = filterExclusions(files, rel, options.exclude);

		if (!contents.length) {
			gotDir(null, result);
			return;
		}

		var keysAreNumeric = true; // assume we need to create an array, until we don't
		var remaining = contents.length;

		function check() {
			if (! --remaining) {
				if (keysAreNumeric) {
					result = toArray(result);
				}

				gotDir(null, result);
			}
		}

		contents.forEach(function (fileName) {
			var filePath = path.join(dir, fileName);
			var key = undefined;

			function gotFile(err, data) {
				if (err) {
					gotDir(err, null);
				} else if (result[key] !== undefined) {
					gotDir('You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath);
				} else {
					result[key] = data;
					check();
				}
			}

			fs.stat(filePath, function (err, stats) {
				if (err) {
					gotDir(err, null);
					return;
				}

				if (stats.isDirectory()) {
					key = fileName;
					getDir$1(root, filePath, options, gotFile);
				} else {
					key = getKey(fileName, options);
					getFile$1(filePath, gotFile, options);
				}

				if (isNaN(+key)) {
					keysAreNumeric = false;
				}
			});
		});
	});
}

function getFile$1(filePath, gotFile, options) {
	fs.readFile(filePath, function (err, result) {
		var data;

		if (err) {
			gotFile(err, null);
		} else {
			data = result.toString();

			if (options.parser) {
				data = options.parser(filePath, data);
			} else {
				try {
					data = JSON.parse(data);
				} catch (e) {
					// treat as text
				}
			}

			gotFile(null, data);
		}
	});
}

var Promise = promise.Promise;

function spelunk(root, options, callback) {
	var promise = new Promise(function (fulfil, reject) {
		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		options = normaliseOptions(options);
		root = path.resolve(root);

		// Get the specified folder, then done
		getDir$1(root, root, options, function (err, result) {
			if (err) return reject(err);
			fulfil(result);
		});
	});

	if (callback) {
		promise.then(function (result) {
			return callback(null, result);
		})['catch'](callback);
	}

	return promise;
}

spelunk.sync = function (root, options) {
	root = path.resolve(root);
	return getDir(root, root, normaliseOptions(options));
};

module.exports = spelunk;