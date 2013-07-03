/*!
 * Demo 04: jade.demo.js
 *
 * Go into the demo/04_jade folder:
 *
 *     cd demo/04_jade
 *
 * Execute the demo application using node to see what it do:
 *
 *     node src/index.js
 *
 * Now execute the `jade.demo.js` to generate the client version
 * of this application, then open the public/index.html in
 * your browser.
 *
 *     node jade.demo.js
 *     open public/index.html
 *
 * The code of `jade.demo.js` use nway API and the result 
 * is the same with the nway command below :
 *
 *     nway src
 *
 * Below, the `jade.demo.js` source :
 * @novadox withcode
 */
var nway   = require('../../lib/nway');    // = require('nway')

nway({
	index: __dirname + '/src'
});