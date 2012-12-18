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
var defaults = require('./defaultOptions')
  , _        = require('underscore')
;


/**
 * Throw an error if the options object is
 * not a valid nway options object (key check)
 *
 * Used by deep nway object that require a valid
 * nway object. As public API (such nway()) always extend options
 * passed with user with default object this is essentialy
 * for unit testing constraint and deep API usages.
 *
 * @param  {object} options An nway option object
 * @param  {array} mustHaveKeys A list of key required (default to
 *    all nway options keys)
 * @throws {Error} If options is not a valid nway option object
 */
module.exports = function(options, mustHaveKeys) {
	var mustHaveKeys = mustHaveKeys || _.keys(defaults)
	  , intersection = _.intersection(mustHaveKeys, _.keys(options))
	;
	if(
		   ('object' !== typeof options) 
		|| (intersection.length !== mustHaveKeys.length)
	) {
		throw new Error('Invalid nway object');
	}
}