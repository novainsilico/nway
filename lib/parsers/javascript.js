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
  , dirname     = require('path').dirname
  , relative    = require('path').relative
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
	var substitute = options.substitute;

	// remove comments
	src = decojs(src);

	// TODO REMOVE STRINGS TO PREVENT require() in string bug

	// List 'arequire' var names:
	// the variables in current source used to call arequire
	// (warning : scope and assignation using anything else than a global var and a require
	// aren't supported)
	var reqs = ['require'];
	src.replace(/([a-z0-9_\$]+) *= *require *\( *('|")([^\'"]+)(\2 *\))/ig, function(match, varname, quote, required) {
		try {
			var realpath = resolve(required, dirname(module.path), options);
		} catch(e) {
			debug('Invalid require path (1)', required, 'from', module.index, e)
			return match; // Gracefull die on invalid require path
		}
		// Is async module ?
		if(realpath === module.arequirePath) {
			reqs.push(varname);
		}
		return match;
	});

	// Override require path, register module found and save
	// require relation (sync / async)
	var regexp = new RegExp(sprintf('([=;,\\s]*)(%s) *\\( *(\'|")([^\'"]+)\\3', reqs.join('|')), 'g');
	src = src.replace(regexp, function(match, before, method, quote, required) {
		// Resolve realpath to required node relative
		// to current parsed source
		try {
			var realpath = resolve(required, dirname(module.path), options);
		} catch(e) {
			debug('Invalid require path (2)', required, 'from', module.index, e)
			return match; // Gracefull die on invalid require path
		}

		// Check for exclude before running parser deeper
		if(_.any(options.excludes, function(exclude) {
			return minimatch(realpath, exclude)
		})) return match;

		// Do path substitution :
		if(substitute[realpath]) {
			debug('Path substitution : %s to %s',
				relative(process.cwd(), realpath),
				relative(process.cwd(), substitute[realpath]));
			realpath = substitute[realpath];
		}

		// Build the module for this module
		var submodule = makeModule(realpath);

		// Save module
		module.req.push({
			 uid:    submodule.uid
			,async:  method != 'require'
		});

		// Replace required by the submodule UID :
		return sprintf('%s%s(%s%s%s', before, method, quote, submodule.uid, quote);
	});

	return src;
}
