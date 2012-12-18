/**
 * Load a client pack
 * 
 * @param  {string}   path     pack path
 * @param  {Function} callback Callback function that receive an error object
 */
		DL.prototype.load = function(path, callback) {
			path = require.alias[path] || path;
			// Allow arequire callback to do sync require
			callback && callback()
		};