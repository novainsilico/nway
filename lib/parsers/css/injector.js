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
var rework    = require('rework')
  , jsParser  = require('../javascript')
  , read      = require('fs').readFileSync
  , join      = require('path').join
  , tmpl      = read(join(__dirname, './templates/injector.js'), 'utf8')
  , getUID    = require('../../utils').uid
  , unifyurl  = require('./unifyurl')
  , join      = require('path').join
  , write     = require('fs').writeFileSync
;

// EXPORT
module.exports = injector;


/**
 * Injector module for css source
 *
 * A nway parser function who create a nway javascript module
 * that offer a css injector for the css source.
 *
 * The module exports:
 *
 *   - inject([media]): Inject css in the page (with a loaded promise)
 *     may be called with a media attribute (default:all)
 *   - eject(): remove css off the page
 *   - injected *boolean*: The css is injected
 *   - location *css*: The css location
 */
function injector(css, module, makeModule, options) {
  output_css      = join(options.output, options.css_folder   || 'css');
  location_css    = join(options.client, options.css_folder   || 'css');

  output_links    = join(options.output, options.links_folder || 'links');
  location_links  = join(options.client, options.links_folder || 'links');

  // Unify css url (and store related assets in a sub directory 'links')
  css = rework(css)
    .use(unifyurl(module.path, output_links, location_links, options))
    .toString();

  // Create the css file
  var uid       = getUID(options) + getUID(css)
    , oFilename = uid + '.css'
    , oFilepath = join(output_css,   oFilename)
    , oLocation = join(location_css, oFilename)
  ;

  write(oFilepath, css, {encoding:'utf8'})

  var js = tmpl.replace(/\{\{location\}\}/, oLocation);
  return jsParser(js, module, makeModule, options);
}


