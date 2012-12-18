/*!
 * Demo 02: arequire.demo.js
 *
 * Go into the demo/02_arequire folder:
 *
 *     cd demo/02_arequire
 *
 * Execute the demo application using node to see what it do:
 *
 *     node src
 *
 * Now execute the `arequire.demo.js` to generate the client version
 * of this application, then open the public/index.html in
 * your browser. In the javascript console, the output is the same
 * of the execution above :
 *
 *     node arequire.demo.js
 *     open public/index.html
 *
 * The both output those messages:
 *
 *     index.js: I get a arequire() function for my module
 *     index.js: For demo purpose, I export my application object
 *     index.js: Go in the FOO part of the application:
 *     index.js: goFoo(). Asynchronously require foo.js. This is an application split point.
 *     foo.js: I am a huge part of the application and I export a function
 *     index.js: foo.js is imported. Execute it exported function foo().
 *     foo.js: I am executed
 *     index.js: Now go in the BAR part of the application:
 *     index.js: goBar(). Asynchronously require bar.js. This is an application split point.
 *     bar.js: I am a huge part of the application and I export a function
 *     index.js: bar.js is imported. Execute it exported function bar().
 *     bar.js: I am executed
 *
 * The code of `arequire.demo.js` use nway API and the result
 * is the same with the nway command below :
 *
 *     nway src
 *
 * Below, the `arequire.demo.js` source :
 * @novadox withcode
 */
var nway   = require('../..');    // = require('nway')

nway({
	index: __dirname + '/src/index.js'
});