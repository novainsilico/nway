// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

/*!
 * Default options for tests
 */

var fpath    = require('./fpath')
  , defaults = require('../../lib/defaultOptions')
  , _        = require('underscore')
;


module.exports = _.extend({}, defaults, {
	  output      : fpath('public')
	, client      : '/public'
	, index       : fpath('lib/client.js')
});