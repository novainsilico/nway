// TODO
// Parse HTML like enyo : to json with extend, etc..

var parse_txt    = require('./txt')

module.exports = function(src, module, makeModule, options) {
	return parse_txt(src, module, makeModule, options);
}