var ASY = require('../../../arequire.js')(require);

console.log('Define %s %s %s', 'a.js', __filename, __dirname);

module.exports = function() {
	console.log('Exec %s %s %s', 'a.js', __filename, __dirname);

	ASY('./b.js', function(b) {
		b();
	});
}