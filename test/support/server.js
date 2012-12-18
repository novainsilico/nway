// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

/*!
 * server.js
 *
 * Http server for functional testing
 */

// IMPORT
var http     = require('http')
  , send     = require('send')
  , indeepmw = (process.env.TEST_COV ? require('../../lib-cov/middleware') : require('../../lib/middleware'))(require('./options'));
;

// Export the app server
var app = module.exports = http.createServer(function(req, res){
	var url = require('url').parse(req.url);
	indeepmw(req, res, function() {
		send(req, url.pathname)
			.root(__dirname + '/../fixtures/')
			.pipe(res);
	});
});

// No parent ? Start server with defaults
if(!module.parent) {
	require('./getport')(function(port) {
		app.listen(port, '127.0.0.1', function(err) {
			console.log('Server listen on http://127.0.0.1:%s/', port);
		})
	})
}