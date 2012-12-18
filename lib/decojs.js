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


// EXPORT
module.exports = decojs;


/**
 * Remove comment in a source code
 *
 * decojs() is remove javascript style single line
 * and multiline comments (// and /*)
 *
 * @param  {string} str The source to de-comment
 * @return {string}     Result string without comment
 */
function decojs(str) {
	var i
		, curChar, nextChar, lastNoSpaceChar
		, inString        = false
		, inComment       = false
		, inRegex         = false
		, newStr          = ''
		, stringOpenWith
	;

	for (i = 0; i < str.length; ++i) {
		curChar = str.charAt(i);
		nextChar = str.charAt(i + 1);

		// In string switcher
		if (!inRegex && !inComment && (curChar === '"' || curChar === "'") && str.charAt(i - 1) !== '\\') {
			if(inString && (curChar === stringOpenWith)) {
				inString       = false;
				stringOpenWith = null;
			} else if(!inString) {
				inString       = true;
				stringOpenWith = curChar;
			}
		}

		// In regex switcher
		if((!inComment && !inString) && (curChar === '/')) {
			if(inRegex
				// Not escaped ... /myregexp\/...../
				&& (str.charAt(i - 1) !== '\\')
				// Or escape char, previously escaped /myregexp\\/
				|| ((str.charAt(i - 1) === '\\') && (str.charAt(i - 2) === '\\'))) {
				inRegex = false;
			} else {
				if(~['=',',','('].indexOf(lastNoSpaceChar)) {
					inRegex = true;
				}
			}
		}

		if(!~['', ' '].indexOf(curChar)) {
			lastNoSpaceChar = curChar;
		}

		// we are not inside of a string or a regex
		if (!inString && !inRegex) {
			// singleline comment start
			if (!inComment && curChar + nextChar === '/'+'/') {
				++i;
				inComment = 1;
			// singleline comment end
			} else if (inComment === 1 && curChar === '\n') {
				inComment = false;
			// multiline comment start
			} else if (!inComment && curChar + nextChar === '/'+'*') {
				++i;
				inComment = 2;
				curChar = '';
			// multiline comment end
			} else if (inComment === 2 && curChar + nextChar === '*'+'/') {
				++i;
				inComment = false;
				curChar = '';
			}
			if (inComment === 2 && curChar  === '\n') {
				// curChar = '\n' (keep line return)
			} else if (inComment) {
				curChar = '';
			}
		}


		newStr += curChar;
	}

	return newStr;
}


decojs.version = require('../package.json').version;