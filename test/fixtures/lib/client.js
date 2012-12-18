var arequire = require('../../../arequire.js')(require);



module.exports = {
	start: function() {
		require('./a.js')();
		require('./x.js')();

		// Require x again to check already stored module
		require('./x.js')();

		// Require x again to check already stored module with the same UID (content hash)
		require('../x-copy.js')();


	}


	,get: function(module, callback) {
		// Only static require is allowed, so we use a switch
		switch(module) {
			case 'underscore':
				arequire('underscore', function(_) {
					callback(_);
				});
				break;
			case 'zepto':
				arequire('./zepto.js', function($) {
					callback($);
				});
				break;
		}
	}
}