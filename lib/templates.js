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
 * template.js
 *
 * Singletion template accessor
 */

// IMPORTS
var fs   = require('fs')
  , join = require('path').join
;

// EXPORT
module.exports = (function() {
	var cache = {};

	function Templates() {};

	Templates.prototype = {
		get bootstrap() {
			if(cache.bootstrap) {
				return cache.bootstrap;
			}
			cache.bootstrap = fs.readFileSync(join(__dirname , './templates/bootstrap.js'), 'utf8');
			return cache.bootstrap;
		}

		,get define() {
			if(cache.define) {
				return cache.define;
			}
			cache.define = fs.readFileSync(join(__dirname , './templates/define.js'), 'utf8');
			return cache.define;
		}

		,get packet() {
			if(cache.packet) {
				return cache.packet;
			}
			cache.packet = fs.readFileSync(join(__dirname , './templates/packet.js'), 'utf8');
			return cache.packet;
		}

		,get loader() {
			if(cache.loader) {
				return cache.loader;
			}
			cache.loader = fs.readFileSync(join(__dirname , './templates/loader.js'), 'utf8');
			return cache.loader;
		}

		,get loaderonepack() {
			if(cache.loaderonepack) {
				return cache.loaderonepack;
			}
			cache.loaderonepack = fs.readFileSync(join(__dirname , './templates/loaderonepack.js'), 'utf8');
			return cache.loaderonepack;
		}
	}

	return new Templates();
})();
