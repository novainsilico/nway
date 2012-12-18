/*!
 * Demo 01: simple.demo.js
 *
 * Go into the demo/01_simple folder:
 *
 *     cd demo/01_simple
 *
 * Execute the demo application using node to see what it do:
 *
 *     node src/index.js
 *
 * Now execute the `simple.demo.js` to generate the client version
 * of this application, then open the public/index.html in
 * your browser. In the javascript console, the output is the same
 * of the execution above :
 *
 *     node simple.demo.js
 *     open public/index.html
 *
 * The both output those messages:
 *
 *     index.js: I require foo.js
 *     foo.js: I require bar.js
 *     bar.js: I export a function
 *     foo.js: I add a function run() to my export object
 *     index.js: I call run() on foo
 *     foo.js: In my run(). Now I call bar.
 *     bar.js: I say hello to Foo
 *
 * The code of `simple.demo.js` use nway API and the result 
 * is the same with the nway command below :
 *
 *     nway src/index.js
 *
 * Below, the `simple.demo.js` source :
 * @novadox withcode
 */
var nway   = require('../..');    // = require('nway')

nway({
	index: __dirname + '/src/index.js'
});