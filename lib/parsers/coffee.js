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
 * nway parser for .js files
 *
 * description
 */


// IMPORTS
var _           = require('underscore')
  , resolve     = require('../resolve')
  , debug       = require('debug')('nway:parser:javascript')
  , minimatch   = require("minimatch")
  , sprintf     = require('underscore.string').sprintf
  , decojs      = require('../decojs')
  , parse_js    = require('./javascript')
;

/**
 * Javascript source parser
 *
 * This parser find required modules and call main parser on them, and, then replace
 * the path by a short uniq internal id (based on module content).
 *
 * This hidding process is motivated by :
 *
 *    - hide the server file structure
 *    - reduce file size
 *
 * We still can use options.alias to explicitly give a readable path name to
 * a module, so it can be called directly with `require('my/alias/path')` in the browser.
 *
 * @param  {string} src     Source to parse and transform
 * @param  {object} module  Module object created by the main parser function
 * @param  {function} makeModule Main parser module creator : receives an absolute
 *                          filepath to parse, and return a new Module object.
 * @param  {object} options An nway option object
 * @return {string}         A parsed (and some time transformed) source
 */
module.exports = function(src, module, makeModule, options) {

	// Coffee parser is required only if needed :
	try {
		var coffee = require("coffee-script")
	} catch(e) {
		throw new Error("You must install coffee-script package in order to parse coffee sources.");
	}


	return parse_js(coffee.compile(src), module, makeModule, options);
}
