var arequire = require('../../../arequire.js')(require);

console.log('Define %s %s %s', 'b.js', __filename, __dirname);




module.exports = function() {
	console.log('Exec %s %s %s', 'b.js', __filename, __dirname);
	arequire('./c.js', function(c) {
		c();
	});
}