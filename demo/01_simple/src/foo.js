// foo.js

console.log('foo.js: I require bar.js');
var bar = require('./bar');

console.log('foo.js: I add a function run() to my export object');
exports.run = function() {
	console.log('foo.js: In my run(). Now I call bar.');
	bar('Foo');
}