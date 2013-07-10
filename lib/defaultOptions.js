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
 * defaultOptions.js : The default option object
 *
 * Default option object used by nway
 *
 * @novadox withcode
 */

module.exports = {
	// Generated file destination (absolute or relative path
	// to the current working directory)
	  output      : './public/generated'

	// Client url to the generated files (relative or absolute url)
	, client      : './generated'

	// The bootstrap file name (*.nocache.* pattern may be used to force static
	// file server to disable cache)
	, bootstrap   : 'bootstrap.nocache.js'

	// Globals are used for script optimisation : those variable
	// are scoped in each packet to reduce file size when using
	// uglify to mangle variable names
	, globals     : 'window, document, console, require'

	// The entry point (absolute or relative path to the
	// current working directory)
	, index       : './index.js'

	// Generated packed file extension
	, extension   : '.js'

	// Do not automaticaly run main entry point (the index) when the DOM is ready
	// (you have to do require('/') by your self when the dom is ready)
	, norun         : false

	// Optimise source with uglify
	, uglify      : false

	// Uglify option : do not mangle names
	, nomangle    : false

	// Uglify option : do not do deep source optimisation
	, nosqueeze   : false

	// Uglify option : generate readable source (comments are
	// allways removed with uglify)
	, beautify    : false

	// Force re-generation even if a generated file allready exist with
	// the same hash
	, force       : false

	// Prepend all the generated file with this string (maybe a copyright)
	, prepend     : null

	// core & node_modules remplacements
	//
	// Node.js core & node_modules remplacement are resolved using the following process :
	//
	// - Check for an alternative in options.alternative : { 'package-name': 'alternative-package-name'}
	// - Check for a browserify alternative : {'http': 'node_modules/http-browserify'}
	// - Check for a nway alternative : {'http': 'node_modules/http-nway'}
	//
	, alternative : {}

	// Replace a file path resolved by another file path path
	, substitute  : {}

	// Alias list :
	//
	//   keys = module alias
	//   value = module resolvable filepath
	//
	// nway provide a default alias for main module (entry point) : '/'
	//
	// You may define alias to manualy doing a require('myAlias') a module
	// in the browser. Remember nway hide the real module path in generated sources
	// as long as you not explicitly provide an alias to them.
	, alias       : {}

	// Used to force re-generation of packet files when nway version
	// has change (as the options are used to generate global uniq id)
	, version     : require('../package.json').version

	// To change global uniq id
	, catkeyboard : ''



	// Array of patterns of filepath to exclude form parsing
	// Use it to enhance compilation speed on allready bundled source without
	// any commonjs mechanism inside.
	//
	// Allowed values are :
	//   - string : Used as a minimatch pattern on absolute file path
	//   - regexp : Used to test absolute file path
	//   - function : Receive the absolute file path and the Module object. Returns a boolean.
	, noparse     : []

	// Exclude some dependency from the generation process
	// You will have to add those dependencies by your self using require.define()
	// Exclude is an array of minimatch (https://github.com/isaacs/minimatch) wildcards
	, excludes    : []


	// compress is a compression function.
	// default is nway.defaultCompressor (based on uglify)
	, compress    : null

	// prewrite is a function to execute on the source before
	// write to disk : the function receive a source, and an object
	// The object may be (instanceof) : an nway/lib/Bootstrap or a nway/lib/DepNode (packet)
	// This function MUST always return a source
	, prewrite    : null

	// Use the onepack builder : all the modules bundled in one source (ignore async splitter)
	, onepack     : false

	// Parsers :
	// an hash of extra parser objects :
	//
	//    - match : minimatch pattern or regex on module filepath or function (with the same
	//      arguments passed to the parse function listed below)
	//    - parse : Parser function that return the parsed (and transformed) source
	//      (see nway/lib/parsers/*) for exemples
	//
	// The parse function used in main nway parser is the one with a `match`
	// pattern that suceed on the filepath
	//
	// Each `parse` function receive those arguments :
	//
	//    - src  (string)   : Source to parse and transform
	//    - module (object) : Module object created by the main parser function
	//    - makeModule (function): Main parser module creator : receives an absolute
	//                        filepath to parse, and return a new Module object.
	//    - options (object): An nway options object
	//
	// And return a parsed (and some time transformed) source
	//
	// nway defaults parsers (in nway/lib/parsers) :
	//
	//   - commonjs javascript source (.js)
	//   - json source (comments allowed) (.json)
	//
	, parsers  : []

	// Search paths for module packages.
	// The standard `node_modules` path is always used, and paths listed below
	// are used as fallback.
	// See [NODE_PATH](http://nodejs.org/api/modules.html) too.
	, paths : []
}