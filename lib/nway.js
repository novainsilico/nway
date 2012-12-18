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
 * nway.js
 *
 * Main access to nway builder and nway utilities (returned by `require('nway')`) :
 *
 * - **nway()**  : The [builder function](#lib/builder.js@builder)
 * - **nway.parser()**  : The [parser](#lib/parser.js)
 * - **nway.buildTree()**  : The [tree builder](#lib/buildTree.js)
 * - **nway.middleware()**  : The [nway middleware](#lib/middleware.js)
 *
 * @novadox withcode
 */

// IMPORT
var parser            = require('./parser')
  , buildTree         = require('./buildTree')
  , builder           = require('./builder')
  , middleware        = require('./middleware')
  , defaultCompressor = require('./defaultCompressor')
;

// EXPORT

// The main exported function is the builder
exports = module.exports = builder;

// Expose nway version
exports.version        = require('../package.json').version;

// Expose some nway utilities
exports.resolve               = require('resolve');
exports.parser                = parser;
exports.buildTree             = buildTree;
exports.middleware            = middleware;
exports.defaultCompressor     = defaultCompressor;