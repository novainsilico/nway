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
var _       = require('underscore')
  , DepNode = require('./DepNode')
  , debug   = require('debug')('nway:buildTree')
;

// EXPORT
module.exports = buildTree;


/**
 * Create the dependency tree weighted from a given
 * module uniq id used as entry point (aliased '/' later)
 *
 * The tree is composed of DepNode object.
 *
 * @param  {object} options  nway options
 * @param  {array} modules   All the parsed modules
 * @param  {boolean|null} optimise Optimise tree (default: true)
 * @return {DepNode}         A DepNode object (traversable as a DepNode tree)
 * @api    public
 */
function buildTree (options, modules, optimise) {
	var packageId = 1
	  , optimise  = optimise === false ? false : true;

	debug('start buildTree()');
	debug('   optimise: %s', optimise);
	debug('   count modules: %s', modules.length);

/**
 * Find a module by is uniq id
 *
 * @param  {string} uid module uniq id
 * @return {Module}     A module object
 */
	function findModule(uid) {
		return _.find(modules, function(module) {return module.uid === uid} );
	}

/**
 * Build a module dependency tree
 *
 * @param  {string} fromUID Entry point module uniq id
 * @param  {DepNode|null} node parent DepNode
 * @return {DepNode}           A DepNode object (traversable as a DepNode tree)
 * @api public
 */
	function builder(fromUID, node) {


		debug('builder fromUID:%s',fromUID);

		// Create a node (or use the provided one)
		var node = node || new DepNode((packageId++).toString(), options);


		// Get the entry point module object
		var fromModule = findModule(fromUID);

		// Add entry point to the module
		node.addModule(fromModule);



		debug('    fromModule.req.length:%s', fromModule.req.length);
		// For each module dependency, add module to
		// the node
		_.each(fromModule.req, function(link) {
			var module = findModule(link.uid);

			// Duplicate : pass
			if(node.hasModule(module.uid)) return;

			if(link.async) {
				debug('        Add async module (%s) to node %s', link.uid, node.id);
				// Async : Create a child node
				node.appendChild(builder(link.uid));
			} else {
				debug('        Add sync module (%s) to node %s', link.uid, node.id);
				// Sync : add module
				node.addModule(module);
				builder(link.uid, node);
			}
		});
		return node;
	}

	// Main recursive call
	var tree = builder(modules[0].uid);

	// Optimisation (see DepNode about optimisation)
	if(optimise) tree.optimise();

	return tree;

}
