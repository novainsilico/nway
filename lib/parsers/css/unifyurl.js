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
var rework     = require('rework')
  , extname    = require('path').extname
  , resolve    = require('path').resolve
  , dirname    = require('path').dirname
  , debug      = require('debug')('nway:parser:css:unifyurl')
  , fs         = require('fs')
  , exists     = require('fs').existsSync
  , join       = require('path').join
  , mkdirp     = require('mkdirp')
  , getUID     = require('../../utils').uid
;

// EXPORT
module.exports = unifyurl;

/**
 * Return a rework middleware to unify css url() ressources by copying
 * target ressources to output.
 * The output folder must be served by a static server according
 * to public location.
 *
 * Work only on relative ressource path
 *
 * Ressources name are md5 hashed (based on absolute file path,
 * modification time and size)
 *
 * @param  {String} cssFilepath
 *         The css source filepath
 *
 * @param  {String} output
 *         The output path where files must be stored
 *
 * @param  {String} location
 *         The public location to the output filepath
 *
 * @param  {Object} options
 *         The nway options object
 *
 * @return {Object} Rework middleware
 */
function unifyurl(cssFilepath, output, location, options) {
  return rework.url(function(url) {

    debug('url: %s', url)

    // Try to resolve to realfile path relativly to
    // css source filepath:
    var sFilepath = resolve(dirname(cssFilepath), url);
    debug('resolved filepath: %s', sFilepath);

    // The file must exists
    if(!exists(sFilepath)) return url;

    // Get file stats
    var stat;
    try {
      stat = fs.statSync(sFilepath);
    } catch(error) {
      // Just trace it for debug
      debug('Warning: error on file stat for %s', sFilepath, error);
      return url;
    }

    // Create an uniq hash name for the file to store
    // this allow life-caching and prevent file name collision
    var uid  = getUID(options) + getUID(JSON.stringify({
      mtime:   stat.mtime,
      filepath:sFilepath,
      size:stat.size
    }));

    // Hence, generate new file name, as the public and local paths
    var oFilename = uid + extname(sFilepath)
      , oFilepath = join(output,   oFilename)
      , oUrl      = join(location, oFilename)
    ;

    // If the destination folder do not exists
    if(!exists(dirname(oFilepath))) {
      // Create
      mkdirp.sync(dirname(oFilepath), '0755');
    }

    // Copy original file to the cached location
    try {
      var inp = fs.createReadStream(sFilepath)
        , out = fs.createWriteStream(oFilepath)
      ;
      inp.pipe(out);
    } catch(error) {
      debug('Warning: error on file copy from %s to %s', sFilepath, oFilepath, error);
      return url;
    }

    return oUrl;

  });
}