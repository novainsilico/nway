var arequire = require('../../../arequire.js')(require);

console.log('Define %s %s %s', 'x-copy.js', __filename, __dirname);

module.exports = function() {
	console.log('Exec %s %s %s', 'x-copy.js', __filename, __dirname);

	arequire('./lib/y.js', function(y) {
		y();
	});
}