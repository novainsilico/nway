

console.log('Define %s %s %s', 'c.js', __filename, __dirname);

require('./z.js')

module.exports = function() {
	console.log('Exec %s %s %s', 'c.js', __filename, __dirname);
}