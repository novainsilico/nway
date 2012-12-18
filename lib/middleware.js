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
var url       = require('url')
	, _       = require('underscore')
	, join    = require('path').join
	, dirname = require('path').dirname
	, nway  = require('./nway.js')
;

// EXPORT
module.exports = middleware;

// CONSTANTS
var cacheMaxAge = module.exports.cacheMaxAge = 60 * 60 * 24 * 365;

/**
 * Middleware contructor
 *
 * Return a connectjs middleware for nway.
 * This middleware force life-cache for the packet files and prevent cache on
 * the bootstrap file.
 *
 * The options object
 *
 * Exemple :
 *
 *     var connect = require('connect')
 *       , http    = require('http')
 *     ;
 *
 *     // The nway options consumed by nway.middleware()
 *     // must be the sames of the one used for the compilation
 *     // (or at least the 'bootstrap', 'client' and 'extension' keys)
 *     var options = {client:'/generated', bootstrap: 'bootstrap.nocache.js', extension: '.js'};
 *
 *     var app = connect()
 *        .use(require('nway').middleware(options))
 *        .use(connect.static('public')) // Path to public files
 *        .listen(3000);
 *
 *     http.createServer(app).listen(3000);
 *
 * @param  {object} options nway options object : must be the same used by generator
 */
function middleware(options) {

	var options       = _.extend({}, require('./defaultOptions.js'), options || {})
	  , bootstrapPath = join(options.client, options.bootstrap)
	  , regClient     = new RegExp('^' + options.client + '\/[^\.\/]*\\'+ options.extension + '$')
	;

	return function(req, res, next) {
		if ('GET' != req.method && 'HEAD' != req.method) return next();
		var path = url.parse(req.url).pathname
		  , dir  = dirname(path)
		;

		if(dir != options.client) return next();

		res.setHeader('X-nway-Middleware', require('../package.json').version);

		if(path == bootstrapPath) {
			// No cache
			res.setHeader('Cache-Control', 'no-cache, must-revalidate, max-age=-1');
			res.setHeader('X-nway-Middleware-nocache', '1');
		} else if(regClient.test(path)) {
			// One year cache :
			res.setHeader('Cache-Control', 'public, max-age=' + cacheMaxAge);
			res.setHeader('X-nway-Middleware-nocache', '0');
		}

		next();
	}

}
