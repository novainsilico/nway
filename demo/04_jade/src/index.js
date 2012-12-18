// index.js

console.log('index.js: I require layout.jade');

// var layout = require('../views/layout.jade');
var demo = require('../views/demo.jade');

var data = {
	rows: [
		 { name: 'noj'}
		,{ name: 'nop'}
		,{ name: 'foo'}
	]
}

document.getElementById('output').innerHTML = demo(data);