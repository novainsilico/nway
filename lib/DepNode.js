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
var _            = require('underscore')
  , getUID       = require('./utils').uid
  , sprintf      = require('underscore.string').sprintf
  , repeat       = require('underscore.string').repeat
  , debug        = require('debug')('nway:DepNode')
  , templates    = require('./templates')
  , join         = require("path").join
  , fs           = require("fs")
  , bytesToSize  = require('./utils').bytesToSize
  , checkOptions = require('./checkOptions')
;

// EXPORT
module.exports = DepNode;


/**
 * DepNode constructor
 *
 * A simple DOM to manage code dependencies
 *
 * @param  {string} id Node id
 * @param  {object} nway options
 */
function DepNode(id, options) {

	debug('new DepNode(%s)', id);

	if('string' != typeof id) {
		throw new Error('Invalid argument : id must be a string');
	}

	checkOptions(options);


	// Parent DepNode reference
	this.parent      = null;

	// Child nodes array
	this.children    = [];

	// This node uniq id
	this.id          = id;

	// List of the modules uniq id stored
	// owned by this node
	this.modules     = [];

	// Current nway options (stored for uid generation)
	this.options     = options

	// Used by debug to show optimization ratio
	this.fromSize = 0;
	this.toSize = 0;

};

/**
 * Remove a child node
 *
 * @param  {DepNode} node Node to remove
 * @return {DepNode}      Removed node
 */
DepNode.prototype.removeChild = function(node) {
	if(node.parent !== this) throw new Error('Node not found');
	node.parent = null;
	this.children = _.without(this.children, node);
	return node;
};

/**
 * Add a child node to this node
 *
 * @param {DepNode} node Node to add
 * @return {DepNode} this node
 */
DepNode.prototype.appendChild = function(node) {
	if(node.parent === this) return this;
	if( node.parent ) {
		node.parent.removeChild(node);
	}
	node.parent = this;
	this.children.push(node);
	return this;
};

/**
 * @param  {string}  module_id Module id
 * @return {Boolean} true if this node contain this module
 */
DepNode.prototype.hasModule = function(module_id) {
	return _.any(this.modules, function(module) {
		return module.uid == module_id;
	});
};

/**
 * Remove a module object
 *
 * @param  {string}  module_id Module id
 * @param  {boolean|null}  recursive Do it recursivly in child nodes
 */
DepNode.prototype.removeModule = function(module_id, recursive) {

	this.modules = _.filter(this.modules, function(module) {
		return module.uid != module_id;
	});

	if(recursive) {
		_.invoke(this.children, 'removeModule', module_id, true);
	}
};

/**
 * Add a module
 *
 * @param {string} module_id the module uniq id
 */
DepNode.prototype.addModule = function(module) {
	if(!this.hasModule(module.uid)) {
		this.modules.push(module);
	}
	return true;
};

/**
 * Return all descendant modules of this node and is descendants
 *
 * @return {array} Array of modules
 */
DepNode.prototype.getBranchModules = function() {
	return _.union(
		[],
		this.modules,
		_.flatten(_.map(
			this.children,
			function(node) {
				return node.getBranchModules()
			})));
}

/**
 * Remove in children any modules required in the current node
 * as they will be allready defined before
 */
DepNode.prototype.removeDescendantDuplicate = function() {
	var me = this;
	_.each(this.children, function(node) {

		node.removeDescendantDuplicate();

		_.each(me.modules, function(module) {
			node.removeModule(module.uid, true);
		});
	});
}

/**
 * Return module that appear more than once in the given
 * list of nodes and their childs
 *
 * @param  {array} branches  array of DepNode
 * @return {array}           List of duplicated module uniq id
 */
DepNode.prototype.getDuplicates = function(branches) {
	var count = {};
	var result = [];
	_.each(_.flatten(branches), function(module){
		if(!count[module.uid]) {
			count[module.uid] = 0;
		}
		count[module.uid]++;
		if(count[module.uid]>1) result.push(module);
	})

	result = _.uniq(result);
	return result;
}

/**
 * Turn up to the first common ancestor any module
 * required into more than one descendant node
 *
 */
DepNode.prototype.turnUpChildDuplicate = function() {
	var me = this;

	// Run on child nodes before :
	_.invoke(this.children, 'turnUpChildDuplicate');

	// Check the union of all child nodes modules :
	var child_modules = _.invoke(this.children, 'getBranchModules');
	var duplicates    = this.getDuplicates(child_modules);

	// Remove module intersection (referenced, at least, in two childrens)
	// and move dependency to current node :
	_.each(duplicates, function (module) {
		// Remove descendant
		_.invoke(me.children, 'removeModule', module.uid, true);
		// Add to current node :
		me.addModule(module);
	});
}


/**
 * Remove from the DepNode tree the nodes that do not contain
 * any modules
 */
DepNode.prototype.removeEmptyNodes = function() {
	var me = this;
	_.each(this.children, function(child) {
		if(!child.modules.length && !child.children.length) {
			me.removeChild(child);
		} else {
			child.removeEmptyNodes();
		}
	})
}

/**
 * Run optimisation :
 *
 *   - Remove dependencies to modules allready required
 *     upper in the tree (removeDescendantDuplicate())
 *   - Put module required more than once time in the
 *     dependency tree in the common ancestor node
 *     (runUpChildDuplicate())
 *   - Remove empty nodes that do not contain any module
 *     after the previous optimisations
 */
DepNode.prototype.optimise = function() {
	this.removeDescendantDuplicate();
	this.turnUpChildDuplicate();
	this.removeEmptyNodes();
};


/**
 * Generate a uniq id for the current node base
 * on the uniq ids of the module owned by this node
 *
 * @return {string} node uniq id
 */
DepNode.prototype.getUID = function() {
	var guid      = getUID(this.options);
	return guid + getUID(_.pluck(this.modules,'uid').join('-'));
};

/**
 * Get an array with modules id for this node
 *
 * @return {array} List of module uids
 */
DepNode.prototype.getModuleIDs = function() {
	return _.pluck(this.modules, 'uid');
}


/**
 * Return a packet object for the current node
 *
 * @return {Packet} The packet object for the current node
 */
DepNode.prototype.toBundle = function() {
	return this;
}

/**
 * Return an array of all packets for the current
 * tree
 *
 * @return {Array} Array of packet objects
 */
DepNode.prototype.getAllBundles = function() {
	var packets = [];

	var walk = function(node) {
		packets.push(node.toBundle());
		_.each(node.children, function(child) {
			walk(child);
		});
	}

	walk(this);

	return packets;
}

/**
 * Return an array of the current node Modules objects
 *
 * @return {Array} Array of Module objects
 */
DepNode.prototype.getModules = function() {
	return this.modules;
}

/**
 * Return an array of the current node Modules objects
 *
 * @return {Array} Array of Module objects
 */
DepNode.prototype.getAllModules = function() {
	var modules = [];
	var walk = function(node) {
		_.each(node.getModules(), function (module) {
			modules.push(module);
		});
		_.each(node.children, function(child) {
			walk(child);
		});
	}
	walk(this);
	return modules;
}





/**
 * Generate the packet source
 *
 * @param  {option} options A nway option object
 * @return {string}         The generated packet source
 */
DepNode.prototype.generate = function(options) {
	debug('Generate %s', this.uid);

	var src  = '';

	// Concat sources of the packet
	_.each(this.modules, function(module) {
		debug(' -', module.relpath)
		var moduleSrc = module.generate();
		if('function' == typeof options.prewrite) {
			moduleSrc = options.prewrite(moduleSrc, module);
		}
		src += moduleSrc;
	});

	// Template substitution data
	var data = {
		 body    : src
		,globals : options.globals
	}

	// Add to template :
	src = templates.packet.replace(/\{\{(body|globals)\}\}/g, function(all, match) {
		return data[match];
	});

	this.fromSize = src.length;

	// compress ?
	if(options.compress) {
		debug(' - compress : ');
		src = options.compress(src, options);
	}

	// Prepend ?
	if(options.prepend) {
		src = options.prepend + '\n' + src;
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
DepNode.prototype.makePath = function(options) {
	return join(options.output, this.getUID() + options.extension);
}

/**
 * Write the packet in the file system
 *
 * @param  {option} options A nway option object
 * @param  {Function} callback A write callback (with error argument)
 */
DepNode.prototype.write = function(options, callback) {
	var self     = this
	  , path     = this.makePath(options)
	  , src      = this.generate(options)
	  , from     = this.fromSize
	  , to       = this.toSize
	;

	debug(' - write', sprintf("%'.-30s %7s > %7s (%s%%)",
		'packet : ' + path,
		bytesToSize(from),
		bytesToSize(to),
		Math.round(to * 100 / from)));

	// Write file :
	fs.writeFile(path, src, function(err) {
		if(err) return callback(err);
		callback();
	});
}


/**
 * Return the dependency tree in colored XML string (for information
 * purpose)
 *
 * @return {string}      XML representation of the tree
 */
DepNode.prototype.toColoredXML = function() {

	var deep     = arguments[0] || 0
	  , packet   = this.toBundle()
	  , modules  = this.modules
	  , children = this.children
	  , s        = ''
	  , i        = repeat(' ', 4)
	  , i1       = repeat(i, deep + 1)
	  , i2       = repeat(i, deep + 2)
	  , i3       = repeat(i, deep + 3)
	  , i4       = repeat(i, deep + 4)
	;

	if(deep === 0) {
		s += '<?xml version="1.0" encoding="UTF-8"?>\n'.grey;
		s += '<tree>\n'.grey;
	}

	s += i1 + '<packet id="'.grey + this.getUID().bold.blue + '" '.grey
		    +  'output="' .grey + packet.makePath(this.options) + '" '.grey;

	if(packet.fromSize) {
		s +=   'from="' .grey + packet.fromSize  + '" '.grey
		    +  'to="' .grey + packet.toSize  + '" '.grey
		    +  'ratio="'.grey + Math.round(packet.toSize * 100 / packet.fromSize)  + '%'+'" '.grey;
	}
	s += '>\n'.grey;

	s += i2 + '<modules>'.grey + (modules.length ? '\n' : '');
	_.each(modules, function(module) {
		s += i3 + '<module id="'.grey + module.uid.bold.blue + '" '.grey
				+ 'file="'.grey + module.relpath + '" '.grey
				+ 'isNodeModule="'.grey + module.isNodeModule + '" '.grey
				+ 'isCore="'.grey + module.isCore + '"'.grey
				+ (module.req.length ? '>\n' : '/>\n').grey


		if(module.req.length) {

			_.each(module.req, function(req) {
				s += i4 + '<require id="'.grey + req.uid + '" async="'.grey + req.async +'"/>\n'.grey
			})
		}

		s += (module.req.length ? i3 + '</module>\n'.grey : '');
	});
	s += (modules.length ? i2 + '' : '')  + '</modules>\n'.grey;

	if(children.length) {
		s += i2 + '<packets>'.grey + (children.length ? '\n' : '');
		_.each(children, function(child) {
			s += child.toColoredXML(deep + 3);
		});
		s += (children.length ? i2 + '' : '')  + '</packets>\n'.grey;
	}
	s += i1 + ('</packet>\n'.grey);

	if(deep === 0) {
		s += '</tree>\n'.grey;
	}

	return s;
};

