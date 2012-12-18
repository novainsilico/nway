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
 * nway default compressor (uglify)
 *
 */

// IMPORTS
var _           = require('underscore')
  , debug       = require('debug')('nway:defaultCompressor')
  , jsp         = require("uglify-js").parser
  , pro         = require("uglify-js").uglify
;

/**
 * Default compressor
 * @param  {string} src     Source to compress
 * @param  {object} options nway options object
 * @return {string}         Compressed source
 */
module.exports = function(src, options) {

	try {
		var ast = jsp.parse(src, false, true);

		if(!options.nomangle)  {
			ast = pro.ast_mangle(ast);
		}
		if(!options.nosqueeze) {
			ast = pro.ast_squeeze(ast);
		}

		src = pro.gen_code(ast, {
			beautify: options.beautify
		});
	} catch(e) {
		debug('Compression error : source returned without compression.', e)
	}

	return src;
}
