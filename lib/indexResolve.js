// (The MIT License)
//
// Copyright (c) 2012-2013 Novadiscovery <osproject@novadiscovery.com>
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



// IMPORTS
var resolve = require('./resolve')
  , dirname = require('path').dirname
  , fs      = require('fs')
;

// EXPORT
module.exports = indexResolve;

/**
 * Try to resolve the index argument :
 *
 *   - a file relative to the current working directory or the main module
 *   - a package name relative to working directory or the main module
 *
 * @param  {string} indexFilePath The index path
 * @return {string}               The resolved index file or null
 */
function indexResolve(indexFilePath, options) {
	var next, result = null;

	var search = [

		// Is a file path relative to current working directory :
		function() {
			result = resolve(fs.realpathSync(indexFilePath), process.cwd(), options);
		}

		// Is a file path relative to main module :
		, function() {
			result = resolve(fs.realpathSync(indexFilePath), dirname(require.main.filename), options);
		}

		// Is a package in node_module relative to current working directory :
		, function() {
			result = resolve(indexFilePath, process.cwd(), options);
		}

		// Is a package in node_module relative to main module :
		, function() {
			result = resolve(indexFilePath, dirname(require.main.filename), options);
		}
	]

	while(next = search.shift()) {
		try {
			next();
			return result;
		} catch(e) {}
	}
}
