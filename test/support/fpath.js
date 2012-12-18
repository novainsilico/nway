// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

/**
 * @param  {string} filename File or folder path relative to fixture folder
 * @return {string}          Absolute path to a file in the fixture folder
 */
module.exports = function (filename) {
	return require('path').resolve(__dirname + '/../fixtures/' + filename);
}