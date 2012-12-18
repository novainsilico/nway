var a = 10, b, ASYNC = require('../../../lib/async.js'), c, d = 10;


var bob = ASYNC;

(function() {
	var bob = 'OTHER SCOPE';
	console.log(ASYNC);
	(function() {
		b = ASYNC;
	})()


	test();
})();

var test = 'ok';

ASYNC(function() {
	var z = require('./z.js');
	console.log('test', z);
	console.log(test);

	ASYNC(function() {
		var z2 = require('./z2.js');
		console.log('test2', z2);
		console.log(test);
	});
});


var test = "OK";