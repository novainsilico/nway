// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

/*!
 * getport.js
 *
 * Function that find and return an available port
 */

var net = require('net');

var portrange = 45032

module.exports = function getport(cb) {
	var port = portrange
	portrange += 1

	var server = net.createServer()
	server.listen(port, function (err) {
		server.once('close', function () {
			cb(port)
		})
		server.close()
	})
	server.on('error', function (err) {
		getport(cb);
		server.close();
	})
}