var arequire = require('../../../arequire.js')(require);



console.log('Define %s %s %s', 'y.js', __filename, __dirname);




module.exports = function() {
	console.log('Exec %s %s %s', 'y.js', __filename, __dirname);
	arequire('./z.js', function(z) {
		z();
	});
}