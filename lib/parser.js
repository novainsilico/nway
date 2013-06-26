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


// IMPORT
var resolve         = require('./resolve')
  , fs              = require('fs')
  , path            = require('path')
  , join            = path.join
  , _               = require('underscore')
  , getUID          = require('./utils').uid
  , builtinsPath    = join(__dirname, './builtins')
  , debug           = require('debug')('nway:parser:action')
  , gdebug          = require('debug')('nway:parser')
  , minimatch       = require("minimatch")
  , Module          = require("./Module")
  , defaults        = require('./defaultOptions')
  , indexResolve    = require('./indexResolve')
  , arequirePath    = require.resolve('../arequire.js')
;

// EXPORT
module.exports = parser;

/**
 * Dependency parser
 *
 * Parse a file and build dependency module list
 *
 * TODO : Refactoring, cleanup and documentation
 *
 * @param  {string} indexFilePath Start file path
 * @return {array}  Array of Module objects
 */
function parser(indexFilePath, options, done) {
	gdebug('Start');

	var modules      = []
	  , deep         = 0
	  , options      = _.extend({}, defaults, options)
	  , noparse      = options.noparse || []
	  , parsers      = [];
	;

	// try to resolve index filepath :
	indexFilePath = indexResolve(indexFilePath);
	if(!indexFilePath) {
		return done(new Error('Index not found for :' + indexFilePath));
	}

	// Prepare path subsitution by resolving all paths 
	// like we resolve the index :
	options.substitute = (function() {
		var substitute   = {};
		_.each(options.substitute, function(to, from) {
			debug('substitution prepare: %s to %s', from, to)
			var _to   = indexResolve(to);
			if(!_to) {
				debug('Module subsitution error this module can not be resolved (to):' + to)
				return done(new Error('Module subsitution error this module can not be resolved (to):' + to));
			}
			var _from = indexResolve(from);
			if(!_from) {
				debug('Module subsitution error this module can not be resolved (from):' + from)
				return done(new Error('Module subsitution error this module can not be resolved (from):' + from));
			}
			debug('    substitution result: %s to %s', _from, _to)
			substitute[_from] = _to;
		})
		return substitute;
	})();

	// Prepare the parser list, option parsers before default parsers :
	_.each(options.parsers, function(def) {
		parsers.push(def);
	});
	parsers.push({match: /\.coffee$/, parse: require('./parsers/coffee')});
	parsers.push({match: /\.css$/, parse: require('./parsers/css')});
	parsers.push({match: /\.html$/, parse: require('./parsers/html')});
	parsers.push({match: /\.jade$/, parse: require('./parsers/jade')});
	parsers.push({match: /\.json$/, parse: require('./parsers/json')});
	parsers.push({match: /\.sass$/, parse: require('./parsers/sass')});
	parsers.push({match: /\.styl$/, parse: require('./parsers/stylus')});
	parsers.push({match: /\.js$/,   parse: require('./parsers/javascript')});
	parsers.push({match: /\.(txt|html)$/,   parse: require('./parsers/txt')});

	// Parse a source an return a valid
	// javascript source injectable in an nway
	// define() template.
	// This method call the first valid parser
	// defined by user (options.parsers) or in
	// the default parsers
	function parse(src, module, makeModule, options) {
		// Find the first valid parser :
		debug('Find a parser for :', module.path)
		var result = _.find(parsers, function(def) {
			// debug('    Check parser match :', def.match)
			if(def.match instanceof RegExp) {
				return def.match.test(module.path);
			} else if ('string'   == typeof def.match) {
				return minimatch(module.path, def.match);
			} else if ('function' == typeof def.match) {
				return def.match(src, module, makeModule, options);
			} else {
				return false;
			}
		});
		if(!result) {
			debug('Warning: No valid parser found for %s. Json string is exported', module.path)
			return 'module.exports = ' + JSON.stringify(src);
		} else {
			debug('Ok parser match :', result.match);
			return result.parse(src, module, makeModule, options);
		}
	}

	// Create a module object for the index
	// receives an absolute filepath to parse, and return
	// a new Module object
	function makeModule(index) {

		var stored, src, srcPath, relpath;

		// Prepare module
		var module  = new Module({
			 uid:    index
			,req:    []
			,path:   index
			,relpath: null
			,isNodeModule: false
			,isAsyncModule: arequirePath === index
			,arequirePath:  arequirePath
			,index:  index
		});

		if(~module.path.indexOf('/node_modules/')) module.isNodeModule = true;

		relpath = path.relative(process.cwd(), module.path);
		relpath = !/^\./.test(relpath) ? './' + relpath : relpath;
		module.relpath = relpath;

		debug('makeModule for %s', relpath);

		// Check for stored version of this path
		stored = _.find(modules, function(p) {
			return module.path === p.path;
		});
		if(stored) {
			debug('allready stored : return (absolute path match)');
			return stored;
		}

		// Read source
		src           = fs.readFileSync(module.path, 'utf8');
		module.mtime  = fs.statSync(module.path).mtime;
		module.uid    = getUID({src: src, path:module.path, options: options});

		// Check for stored version with same uid
		stored = _.find(modules, function(p) {
			return module.uid  === p.uid;
		});
		if(stored) {
			debug('allready stored : return (md5 hash match)');
			return stored;
		}

		// Save module
		modules.push(module);

		// Do not parse ?
		module.notparsed = _.find(noparse, function(np) {
			if(np instanceof RegExp) {
				return np.test(module.path);
			} else if ('string'   == typeof np) {
				return minimatch(module.path, np);
			} else if ('function' == typeof np) {
				return np(module.path, module);
			} else {
				return false;
			}
		});

		// Parse
		if(module.notparsed) {
			debug('  no parse');
		} else {
			debug('  run parse');
			src = parse(src, module, makeModule, options);
		}

		// Store the module source :
		module.source = src;


		// Return the module object

		debug('end %s', relpath);
		return module;
	}

	var root = makeModule(indexFilePath);

	process.nextTick(function() {

		gdebug('End');
		done(null, modules);
	})
}

