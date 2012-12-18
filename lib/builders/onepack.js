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
var _         = require('underscore')
  , debug     = require('debug')('nway:builder:onepack')
  , total     = require('debug')('nway:builder:onepack:total')
  , defaults  = require('../defaultOptions')
  , buildTree = require('../buildTree')
  , parser    = require('../parser')
  , Bootstrap = require('../Bootstrap')
  , templates = require('../templates')
;

// EXPORT
module.exports = onepack;

/**
 * The onepack builder : generate a standalone file with all
 * the modules packed in.
 *
 * The result object returned to the builder is the generated source
 *
 * @param  {object}   options  nway options (see defaultOptions)
 * @param  {Function} callback A callback that receive an error and a resulte object
 * @api public
 */
function onepack(options, callback) {
	total('Start'); // Total is a time debug()

	var options   = _.extend({}, defaults, options)
	  , callback  = (callback || function() {})
	  , modules
	  , generated
	;


	debug('prepare');

	parser(options.index, options, function(err,  modules) {

		debug('Parser end, get all modules contents.');
		var allmodules = _.invoke(modules, 'generate').join('\n');

		debug('Build the tree ...');

		var tree          = buildTree(options, modules, true);

		debug('Prepare datas ...');
		var data = {
			 allmodules: allmodules
			,loader:     templates.loaderonepack
		}

		var bootstrap = new Bootstrap();

		generated = bootstrap.generate(tree, options, templates.bootstrap, data );


		callback(null, generated);


	});




}
