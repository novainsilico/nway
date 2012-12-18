// bar.js

console.log('bar.js: I export a function');

module.exports = function(who) {
	console.log('bar.js: I say hello to', who);
}