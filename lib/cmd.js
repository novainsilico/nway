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
 * nway command line executable
 *
 * @novadox withcode
 */

// IMPORT
var Command         = require('commander').Command
  , colors          = require('colors')
  , fs              = require('fs')
  , _               = require('underscore')
  , sprintf         = require('underscore.string').sprintf
  , nway            = require('./nway')
  , defaultOptions  = require('./defaultOptions')
  , indexResolve    = require('./indexResolve');
;


// Create a command line utility
var app = new Command('nway');

app
	.version(nway.version)
	.usage('[options] <index>')
	.option('-b, --bootstrap [string]', 'Bootstrap file path ['+defaultOptions.bootstrap+']', defaultOptions.bootstrap)
	.option('-c, --client [string]', 'Client relative path to load module packages ['+defaultOptions.client+']', defaultOptions.client)
	.option('-e, --extension [string]', 'Extension to append to generate package ['+defaultOptions.extension+']', defaultOptions.extension)
	.option('-f, --force', 'Force compilation, even if the destination file exist@['+defaultOptions.force+']', defaultOptions.force)
	.option('-m, --nomangle',  'Do not mangle names (used only with --uglify) ['+defaultOptions.nomangle+']', defaultOptions.nomangle)
	.option('-o, --output [string]', 'Output path for generated module packages ['+defaultOptions.output+']', defaultOptions.output)
	.option('-p, --prepend [string]', 'Prepend all generated script with a string ['+defaultOptions.prepend+']', defaultOptions.prepend)
	.option('-n, --norun', 'Do not run entry point automaticaly when DOM is ready ['+defaultOptions.norun+']', defaultOptions.norun)
	.option('-s, --nosqueeze', 'No deep optimization (used only with --uglify) ['+defaultOptions.nosqueeze+']', defaultOptions.nosqueeze)
	.option('-u, --uglify',  'Uglify source using Uglify.js ['+defaultOptions.uglify+']', defaultOptions.uglify)
	.option('-y, --beautify',  'Generate human readable source (used only with --uglify) ['+defaultOptions.beautify+']', defaultOptions.beautify)
	.option('--onepack',  'Pack all modules in a standalone source and send the result on the standards output  ['+defaultOptions.onepack+']', defaultOptions.onepack)
;

// Parse the command line arguments
app.parse(process.argv);

// Retrieve the entry point
var index = app.args[0] ? app.args[0] : null;

if(!index) {
	console.log('Error : '.bold.red, 'Invalid arguments. Index required.');
	console.log(app.helpInformation());
	process.exit(1);
}


// Resolve index :
var resolvedIndex = indexResolve(index, {})//= resolvedIndex;
try {
	if(!resolvedIndex) throw new Error('Index argument "' + index + '" can\'t be resolved to a valid entry point.');
} catch(e) {
	console.log('Error : '.bold.red + ' %s', e.message);
	process.exit(1);
}

app.index = resolvedIndex;

// Prepare the configuration object :
var config = _.extend({}, defaultOptions);

_.each(config, function(v, k) {
	if(app[k] && (k != 'version')) {
		config[k] = app[k];
	}
});


if(config.onepack) {

	nway(config, function(err, result) {
		if(err) {
			console.log('Error : '.bold.red, err );
			process.exit(1);
		} else {
			console.log(result);
		}
	});

} else {

	console.log('');
	console.log('                  Start nway Generator               '.blue.inverse);

	// Print out the current configuration
	console.log('--------------------- Configuration -------------------'.blue.bold);
	_.each(config, function(v, k) {
		console.log(sprintf("%'.-30s %s", k.blue + ' ', v));
	});



	// Start the generator
	nway(config
		, function(err, result) {
		if(err) {
			console.log('Error : '.bold.red, err );
			process.exit(1);
		} else {
			console.log('-------------------- Dependency tree ------------------'.blue.bold);
			console.log(result.tree.toColoredXML());
			console.log('                  Generation succesfull                '.blue.inverse);
			console.log('');
		}
	});

}