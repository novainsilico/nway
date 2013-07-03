// index.js

console.log('index.js: I get a arequire() function for my module');
var arequire = require('../../../lib/arequire.js')(require) // usualy do : require('nway/arequire')(require)

console.log('index.js: For demo purpose, I export my application object');

var application = module.exports = {

	goFoo: function(callback) {
		console.log('index.js: goFoo(). Asynchronously require foo.js. This is an application split point.');
		arequire('./foo.js', function(err, foo) {
			if(err) throw err;
			console.log('index.js: foo.js is imported. Execute it exported function foo().');
			foo();
			callback && callback();
		})
	}


	,goBar: function(callback) {
		console.log('index.js: goBar(). Asynchronously require bar.js. This is an application split point.');
		arequire('./bar.js', function(err, bar) {
			if(err) throw err;
			console.log('index.js: bar.js is imported. Execute it exported function bar().');
			bar();
			callback && callback();
		})
	}
}


console.log('index.js: Go in the FOO part of the application:');
application.goFoo(function() {
	console.log('index.js: Now go in the BAR part of the application:');
	application.goBar();
});