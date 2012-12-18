/*!
 * Demo 05: coffee.demo.js
 *
 * Go into the demo/05_coffee folder:
 *
 *     cd demo/05_coffee
 *
 * Execute the demo application using node to see what it do:
 *
 *     node src
 *
 * Now execute the `coffee.demo.js` to generate the browser version
 * of this application, then open the public/index.html in
 * your browser, and see what happen in the console.
 *
 *     node coffee.demo.js
 *     open public/index.html
 *
 * The code of `coffee.demo.js` use nway API and the result
 * is the same with the nway command below :
 *
 *     nway src
 *
 * Below, the `coffee.demo.js` source :
 *
 * @novadox withcode
 */
var nway   = require('../..');    // = require('nway')

nway({
	index: __dirname + '/src'
});