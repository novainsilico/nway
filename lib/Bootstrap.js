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
var _           = require('underscore')
  , debug       = require('debug')('nway:Bootstrap')
  , templates   = require('./templates')
  , fs          = require("fs")
  , join        = require('path').join
  , bytesToSize = require('./utils').bytesToSize
  , sprintf     = require('underscore.string').sprintf
  , dirname     = require('path').dirname
  , mkdirp      = require('mkdirp')
;

// EXPORT
module.exports = Bootstrap;

/**
 * Bootstrap constructor
 *
 * @param {object} init Initialisation object
 */
function Bootstrap() {
	// Used by debug to show optimization ratio
	this.fromSize = 0;
	this.toSize   = 0;
}

/**
 * Generate the bootstrap source
 *
 * @param  {DepNode} tree   A nway DepNode (dependency node) tree
 * @param  {option} options A nway option object
 * @param  {string} options Force the template source
 * @param  {object} options Override template datas
 * @return {string}         The generated bootstrap source
 */
Bootstrap.prototype.generate = function(tree, options, template, data) {
	var alias   = {}
	  , packets = tree.getAllBundles(options)
	  , modules = tree.getAllModules()
	  , config
	  , src
	  , template = template || templates.bootstrap
	  , data     = data || {}
	;

	// The tree must, at least, contain one module :
	if(!modules[0]) {
		throw new Error("The tree must contain, at least, one module");
	}

	// Create a config information for bootstrap
	config = {
		client        : options.client
		,extension    : options.extension
		,norun        : options.norun
		,map          : {}
		,main         : modules[0].uid // Root module
	}

	// Packet id mapping
	_.each(packets, function(packet) {
		config.map[packet.getUID()] = _.pluck(packet.modules, 'uid');
	});


	// Transposed alias list :
	_.each(options.alias, function(to, from) {
		var realpath;
		try {
			realpath = fs.realpathSync(to);
		} catch(e) {
			debug('Invalid alias (no file found) (1): ' + from + ' -> ' + to);
			return;
		}

		// Search for related module :
		var module = _.find(modules, function(m) {
			return m.path == realpath
		});
		if(!module) {
			debug('Invalid alias (no module found) (2): ' + from + ' -> ' + to);
		} else {
			alias[from] = module.uid;
		}
	});


	// Always add alias / to entry point :
	alias['/'] = modules[0].uid;

	// Template data :
	var data = _.extend({}, {
		 config : JSON.stringify(config)
		,alias :  JSON.stringify(alias)
		,loader:  templates.loader
	}, data);

	// Apply to template :
	src = template.replace(/\{\{(\w*)\}\}/g, function(all, match) {
		return data[match] || '';
	});

	this.fromSize = src.length;

	// compress ?
	if(options.compress) {
		debug(' - compress : ');
		src = options.compress(src, options);
	}

	if('function' == typeof options.prewrite) {
		src = options.prewrite(src, this);
	}

	this.toSize = src.length;

	return src;
}



/**
 * Generate the packet filepath
 *
 * @param  {option} options A nway option object
 * @return {string}         The generated packet filepath
 */
Bootstrap.prototype.makePath = function(options) {
	return join(options.output, options.bootstrap);
}

/**
 * Write the packet in the file system
 *
 * @param  {DepNode} tree   A nway DepNode (dependency node) tree
 * @param  {option} options A nway option object
 * @param  {Function} callback A write callback (with error argument)
 */
Bootstrap.prototype.write    = function(tree, options, callback) {
	var self     = this
	  , path     = this.makePath(options)
	  , src      = this.generate(tree, options)
	  , from     = this.fromSize
	  , to       = this.toSize
	;

	debug(' - write', sprintf("%'.-30s %7s > %7s (%s%%)",
		'bootstrap : ' + path,
		bytesToSize(from),
		bytesToSize(to),
		Math.round(to * 100 / from)));

	// Make sure path exists, then write file :
	mkdirp(dirname(path), function() {
		// Write file :
		fs.writeFile(path, src, function(err) {
			if(err) return callback(err);
			callback();
		});
	});

}