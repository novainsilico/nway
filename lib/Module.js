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
 * Module.js : The module object
 *
 * Module are created by the parser and contain all the required informations
 * for the compilation
 */


// IMPORTS
var _         = require('underscore')
  , templates = require('./templates')
;


// EXPORT
module.exports = Module;

/**
 * Module constructor
 * @param {object} init Initialisation object
 */
function Module(init) {
	var self = this;

	// A uniq id
	this.uid     = null;

	// List of required modules :
	// a list of object with to property :
	//   - uid  : the required module uid
	//   - async : the require is synchronous or asynchronous
	this.req     = [];

	// Absolute real path to the module file
	this.path    = null

	// Relative path to the module (relative to the process.cwd())
	this.relpath = null

	// Flag : this is a module located in node_modules
	this.isNodeModule = false

	// Flag : this is a nodejs core module
	this.isCore  = false;

	// Source : the module script source
	this.source  = null;

	// Prevent from parsing for require() calls:
	this.doNotParse = false;

	_.each(init, function(v,k) { self[k] = v});
}


/**
 * Get an uid array of required module
 *
 * @param {boolean|null} async Filter list with only sync or async module (no filter if null)
 * @return {array} Required modules uid list
 */
Module.prototype.getRequired = function(async) {
	var list = _.filter(this.req, function(m) {
		return async === true ? m.async : async === false ? !m.async : true;
	});
	return _.pluck(list, 'uid');
}


/**
 * Generate the pseudo-amd source for the current module
 *
 * @return {string} Generated source
 */
Module.prototype.generate = function() {
	var data, src;

	// Template substitution data
	data = {
		 body : this.source
		,uid :  this.uid
		,path:  this.relpath
	}

	// Apply to template and return generated source :
	return templates.define.replace(/\{\{(body|uid|path)\}\}/g, function(all, match) {
		return data[match];
	});

}