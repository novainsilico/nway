// index.js

console.log('index.js: I require foo.js');
var foo = require('./foo');

console.log('index.js: I call run() on foo');
foo.run();