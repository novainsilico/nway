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
var standard          = require('./builders/standard')
  , onepack           = require('./builders/onepack')
  , defaultCompressor = require('./defaultCompressor')
;

// EXPORT
module.exports = builder;

/**
 * The builder
 *
 * This is the main nway function. The builder read the options
 * object and generate all the static files.
 *
 *
 * @param  {object}   options  nway options (see defaultOptions)
 * @param  {Function} callback A callback that receive an error and a resulte object
 * @api public
 */
function builder(options, callback) {

	// Default compressor ?
	if(options.uglify && !options.compress) {
		options.compress = defaultCompressor;
	}

	if(options.onepack) {
		return onepack(options, callback)
	} else {
		return standard(options, callback)
	}
}