/*!
 * Demo 03: substitute.demo.js
 *
 * Go into the demo/03_substitute folder:
 *
 *     cd demo/03_substitute
 *
 * Execute the demo application using node to see what it do:
 *
 *     node src
 *
 * Now execute the `substitute.demo.js` to generate the client version
 * of this application, then open the public/index.html in
 * your browser. In the javascript console, the output is intentionaly
 * NOT THE SAME of the node execution :
 *
 *     node arequire.demo.js
 *
 *     open public/index.html
 *
 * The `node src` result is :
 *
 *     index.js: Require and execute foobar.js
 *     foobar.js: Hello
 *
 * The browser result is :
 *
 *     index.js: Require and execute foobar.js
 *
 * And in the page you see : "foobar.js: Hello I'am the browser alternative !"
 *
 * BUT remember that you do not have to do this kind of thing for testing
 * as some awesome lib offert headless browser for testing browser applications
 * like [Zombie.js](http://zombie.labnotes.org/), [PhantomJS](http://phantomjs.org/)
 * or [CasperJS](http://casperjs.org/)
 *
 * Below, the `substitute.demo.js` source :
 * @novadox withcode
 */
var nway   = require('../../lib/nway');    // = require('nway')

nway({

	index: __dirname + '/src/index.js'

	, substitute: {
		// Substitute the src/foobar.js by is the browser-only version :
		"./src/foobar.js" : "./src/foobar.browser.js"
	}

});