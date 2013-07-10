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
var resolve      = require('resolve')
  , join         = require('path').join
  , pathSep      = require('path').sep
  , builtinsPath = join(__dirname, './builtins')
  , normalize    = require('path').normalize
  , _            = require('underscore')
  , debug        = require('debug')('nway:resolve')
;


module.exports  = function(path, basedir, options) {
	debug(path);

	var options = options || {};

	// Normalize path and prepare path alternatives
	var isRelative  = path.charAt(0) === '.';
	var path        = normalize(path);

	// Keep ./ (or .\) for relative path
	if(isRelative && path.charAt(0) !== '.') {
		path = '.' + pathSep + path;
	}

	// Path parts to build alternative paths
	var parts       = path.split(pathSep);
	var isAbsolute  = path[0] === '' || ~path[0].indexOf(':');

	function getPath(alternative) {
		var aparts = _.clone(parts);
		if(!isRelative && !isAbsolute && alternative) {
			aparts[0] = alternative;
		}
		return aparts.join(pathSep);
	}

	var resolverOptions = {
		 basedir: basedir
		,paths:   options.paths
	}

	// Resolver search suite: called in series
	var search = [

		// Use standards resolver (relative, absolute or package path)
		function() {
			if(resolve.isCore(path)) throw new Error();
			debug('  - standard');
			return resolve.sync(getPath(options.alternative && options.alternative[parts[0]]),resolverOptions);
		}

		// Try to use a browserify package
		,function() {
			if(isRelative || isAbsolute) throw new Error();
			debug('  - browserify');
			return resolve.sync(getPath(parts[0] + '-browserify'), resolverOptions);
		}

		// Try to use a nway package
		,function() {
			if(isRelative || isAbsolute) throw new Error();
			debug('  - nway');
			return resolve.sync(getPath(parts[0] + '-nway'), resolverOptions);
		}

		// Try to use a builtin package
		,function() {
			if(isRelative || isAbsolute) throw new Error();
			debug('  - builtin');
			return resolve.sync(builtinsPath + part[0], resolverOptions);
		}

	]

	while(next = search.shift()) {
		try {
			return next();
		} catch(e) {}
	}

	throw new Error("Cannot find module '" + path + "'");
}
