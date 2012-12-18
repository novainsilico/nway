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

/*!
 * arequire.js : Async require, an nway splitter
 */

// EXPORT
module.exports = arequireGenerator;

/**
 * Generate an asynchronous require function based
 * on a module require function
 *
 * Usage :
 *
 *     var arequire = require('nway/arequire')(require)
 *
 *     arequire('mymodule', function(mymodule) { console.log(mymodule) })
 *
 *
 * @param  {function} parentRequire require function in the scope of the module that use arequire
 * @return {function}               a scoped arequire function
 */
function arequireGenerator(parentRequire) {
	if('function' != typeof parentRequire) {
		throw new Error('Invalid parentRequire argument : You must provide a node require function. You may have forgotten to generate your arequire function like this : var arequire = req'+'uire("nway/arequire")(require)')
	}
	return function(required, callback) {
		if('string' != typeof required) {
			throw new Error('Invalid module path : You must provide a valid module path.')
		}
		if('function' != typeof callback) {
			throw new Error('Invalid callback argument : You must provide a function')
		}

		function cb(err) {
			if(err) {
				return callback(err);
			}
			try {
				callback(null, parentRequire(required));
			} catch(e) {
				return callback(e);
			}
		}

		if(require.loader) {
			// Client side
			require.loader.load(required, cb);
		} else {
			// Server side
			process.nextTick(cb);
		}
	}
}