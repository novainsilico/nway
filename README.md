# nway

**Deprecation Notice**

Nway was an innovative way to bundle application from another time, this project is no longer maintained. Please consider [browserify](http://browserify.org/) and [webpack](https://webpack.github.io/).

---


Bundle commonjs javascript modules for the browser with cache optimisation: write browser-side script the node's way !

**Github project:** https://github.com/novadiscovery/nway ● **Full documentation:** http://nway.novadiscovery.com/



# Features

  - Transforms node.js modules to browser-side code
  - [Optimize](#cache_optimisation) client side cache by generating uniq, life-cachable, bundle of minimized sources.
  - Provides a [connect.js](http://www.senchalabs.org/connect/) [middleware to apply cache information](#middleware) to HTTP responses before the static provider treats the request (may be [connect.static()](http://www.senchalabs.org/connect/static.html)).
  - [Asynchronous code splitter module to drive client bundle generation](#arequire)
  - [Module substitution to browser-only module](#substitute)
  - [Script compression using uglify](#uglify)
  - [Command line utility](#cmd) and [JavaScript API](#api)

# Installation

## With npm

    npm install -g nway

## Or clone the git repository

    git clone git://github.com/novadiscovery/nway.git

Then do

    cd nway
    npm install

Link nway in npm to use the command line utility:

    npm link

# Introduction ##

## It would be great if ... ###

When you use Node.js for **server side** code, it is really great to **use the same language than client side** for many reasons. But, when you create client side code, it would be even greater if you could **organize your code the same way** you do for server side. And, in some cases, be able to **use the same code, server and client side** (at least part of it).

## CommonJS is from Mars, AMD is from Venus ###

Node provides an awesome way to create modular projects. This modularity, among other things, is a reason of the success of [node.js](http://nodejs.org/). It uses the [CommonJS convention](http://commonjs.org), and is implementation is described in the [module documentation](http://nodejs.org/api/modules.html).

But the CommonJS convention is a synchronous paradigm: all the dependencies must be instantly accessible. There is no mechanism to asynchronously load a dependency like [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD) do. That is usualy what we need in rich client applications where source code size may be huge: to load only want we need and differ the loading of other parts of the application according to user needs.

## nway magic trick ###

Nway transforms for you synchronous Node CommonJS modules into optimized client side AMD-like modules.

By detecting dependencies between your modules, and by adding an asynchronous code splitting concept, nway *understands* your application workflow and packs generated AMD-like modules in many cachable optimized files. This part of nway is inspired from [Google Web Toolkit Code Splitting](https://developers.google.com/web-toolkit/doc/latest/DevGuideCodeSplitting) mechanism.

## What nway does ###

**Consider the following module graph. Each dot represents a CommonJS module eventually requiring some other modules. The entry point can be any module identified as a main module (usually the index.js of a package).**

All your *client side modules* are standard Node.js modules, like any other module. They can require any *server side* module, packaged modules (such underscore or async) as well as Node.JS core modules (with some limitations).

The only difference is the use of an asynchronous require method (provided by nway). This asynchronous require `arequire()` is used to identify **splitting points** in your application workfow.

![Client and server side modules](http://nway.novadiscovery.com/nway_01.png)

---

**Now, using nway, the following bundles will be identified, packed and optimized.**

When a spliting point is reached, nway loads asynchronously the bundle that contains the required module (if not allready loaded) before returning the required module object.

![Packet resolved](http://nway.novadiscovery.com/nway_02.png)

---

**The *module & require* point of view of the application workflow will be as follows (every behavior is configurable):**

  - The client loads an un-cachable bootstrap (`bootstrap.nocache.js`) that contains both the the basic loading system and the dependency map.
  - The bootstrap automaticaly loads the main (generated) bundle `E4FA2896C.js`: this is the one that contains the entry point module.
  - The entry point is started and, as the user goes deeper and deeper in the application, the spitting points are reached thus triggering the loading of the required bundles (C then D or B).
  - The loaded bundle is a javascript file identified by a hash name (e.g. `5FA13642E.js`) based on its content and the configuration used by nway to compile it: Using nway's middleware or any other static server mechanism, the bundle's files are served with cache ad-vitam HTTP headers.

![Packet and splitting point workflow](http://nway.novadiscovery.com/nway_03.png)

## nway just use nodejs modules mechanism ###

As the main usage of nway is to transform any nodejs module into browser compatible modules, not any transformation of your code is required to make it work with nway.

Unless you need to explicitly split your application in asynchronously loaded bundles, nway only rely on standard **module** concept: `module.exports` object and `require()` mechanism:

  - *"In Node, files and modules are in one-to-one correspondence"* ([nodejs module documentation](http://nodejs.org/api/modules.html))
  - `module.exports` is a object always defined in a module. By default `module.exports` is an empty object `{}`. The value assigned to the `module.exports` object is what a module expose to those who requiring this module. `module.exports` support any kind of javascript value: object, string, number, function, date, boolean, array, etc.
  - `require()` is a module scoped function used to import other modules. The value returned by `require('./foo.js')` is the value assigned to `module.exports` by the `./foo.js` module.
  - A required module is only executed once. The exported value is cached for later require() calls done in any other modules.
  - The  path passed to the `require()` function may be:
    - A relative or absolute path to a file (with, or without .js extension): `require('./foo')` where `foo.js` is a file in the same folder.
    - A relative or absolute path to a folder with a `index.js` file inside: `require('./bar')` where `bar` is a folder with a `index.js` file inside.
    - A node package installed with npm localy or globaly: `require('underscore')` where `underscore` is node package resolvable by the nodejs `require.resolver()`.

# Give us an exemple ! ##

## Let's first write some standard server-side node module.

The first exemple uses [demo/01_simple](#demo/01_simple/simple.demo.js):

    demo/01_simple (where the commands, below, are executed)
     ├╴■ public
     | ├╴■ generated
     | └╴▫ index.html
     ├╴▫ simple.demo.js
     └╴■ src
       ├╴▫ bar.js
       ├╴▫ foo.js
       └╴▫ index.js


**src/index.js:**
This is the entry point of our application

    console.log('index.js: I require foo.js');
    var foo = require('./foo');

    console.log('index.js: I call run() on foo');
    foo.run();

**src/foo.js:**

    console.log('foo.js: I require bar.js');
    var bar = require('./bar');

    console.log('foo.js: I add a function run() too my export object');
    exports.run = function() {
      console.log('foo.js: In my run(). Now I call bar.');
      bar('Foo');
    }

**src/bar.js:**

    console.log('bar.js: I export a function');

    module.exports = function(who) {
      console.log('bar.js: I say hello to', who);
    }

**public/index.html:**
This file only import the nway generated bootstrap:

    ...
    <script src="./generated/bootstrap.nocache.js" type="text/javascript" charset="utf-8" sync="true"></script>
    ...

## This demo do really usefull things:

*You can run `node src/index.js` to see what happen when execute server side with node*

  - index.js require foo.js
  - foo.js require bar.js
  - bar.js export a Function
  - foo.js add a function run to the exports object
  - index.js call run() on foo.js
  - foo.js call the function exported by bar in is run() function
  - bar.js execute the executed function called by foo

## nway it ! ###

Now, using the nway command line, we generate the client version of this usefull application. The path given to nway is the main module (the entry point) of the application:

    nway src/index.js

nway shows both the configuration used to generate client sources and the resolved dependency tree.

By [default](#lib/defaultOptions.js) nway will output the client generated files in the `public/generated` folder (you can change this by using the `-o --output` option).

In the `public/generated` there are now two files:

    public/generated
     ├╴▫ bootstrap.nocache.js
     └╴▫ F9C09E355E2151A2.js

<a name="cache_optimisation"></a>
**The `bootstrap.nocache.js` is included by `public/index.html`**:
This tiny file contains a script loader that knows which file contains the required application modules. The bootstrap is very small, and changes as the application changes: that is why the client browser must **never keep it in cache**.

**The `F9C09E355E2151A2.js` file contains all the application modules'**:
The name may be different: the first 8 chars `F9C09E35` change depending on nway's options and version number, the last 8 chars `5E2151A2` change with the modules contents: that is why the client browser **can keep it in cache for life**.

*See [nway middleware and cache optimisation](#middleware)* for more information about this

Now, open `public/index.html` in a browser. Open the javascript console. You should see the following output:

    index.js: I require foo.js
    foo.js: I require bar.js
    bar.js: I export a function
    foo.js: I add a function run() to my export object
    index.js: I call run() on foo
    foo.js: In my run(). Now I call bar.
    bar.js: I say hello to Foo

That is the same result of the *server side* execution using only node: `node src/index.js`.

The [demo/01_simple/simple.demo.js](#demo/01_simple/simple.demo.js) file do, with the nway API, exactly what we do with nway command line.

## What happens when the `index.html` file is executed?

  1. The `bootstrap.nocache.js` file is loaded, it contains the AMD mechanism (require, define, script loader, ...) and the application map (index of bundle files and the modules they contain).
  2. When the DOM is ready, the bootstrap resolve wich file contains the main module — index.js, the entry point — (`F9C09E355E2151A2.js`) and loads it.
  3. The `F9C09E355E2151A2.js` file register the modules it contains (among which the main module).
  4. The main module is executed by the bootstrap with the appropriate scoped variables (require(), module.exports, etc.)
  5. The main module requires foo.js, foo.js is executed with some dedicated scoped require, and so on.


<a name="arequire"></a>
# arequire: the asynchronous require() ##

## Devide and conquer... speed ###

As we said before, nway does not force you to use nway-specific code to work: everything works just like it would in node. But, from the browser-side point of view, as your rich internet application become huge you don't want to load all the application at once. You just want to load progressively the parts of the application that the user needs. Also, if you update only a small part of your application, you don't want to loose all the benefits of the client browser cache (*See [nway middleware and cache optimisation](#middleware)*)...

**That is why, nway provides an application splitter: `arequire()`.**

`arequire()` is totally compatible with node. It is just a node module that provides the same behavior than node's `require()` except that the result (the exported value) is returned asynchronously to a callback function:

    // The require() way:
    var foo = require('foo');
    console.log(foo);

    // The arequire() way:
    arequire('foo', function(err, foo) {
      console.log(foo)
    });

The goal of `arequire()` is not to remplace `require()`! You can just use it when you want **nway** to split your application.


## How to import arequire() ###

**arequire()** is very special: it needs the `require()` function of your module to work. So nway provides an `arequire` generator:

    // Get an arequire method for the current module:
    var arequire = require('nway/arequire')(require);

It is a good habit to import arequire() at the begining of your module. Of course, the variable name does not necessarily have to be *arequire*.

The only restriction is: **do not use another variable with the same name in your module**. It may work, but it could confuse nway's parser. In fact, essentialy due to performance reasons, nway's parser will not try to detect variable's scopes. Anyway you don't want to do this because is not neat!

## Exemple using arequire(): [demo/02_arequire](#demo/02_arequire/arequire.demo.js) ###

    demo/02_arequire  (where the commands, below, are executed)
     ├╴▫ arequire.demo.js
     ├╴■ public
     | ├╴■ generated
     | ├╴▫ index.html
     | └╴▫ style.css
     └╴■ src
       ├╴▫ bar.js
       ├╴▫ foo.js
       └╴▫ index.js

**src/index.js:**
This is the entry point of our application

    console.log('index.js: I get a arequire() function for my module');

    // This is where arequire is imported.
    //
    // It is a good habit to import arequire() on top of your module.
    // The variable name does not have to be 'arequire', but it can prevent
    // confusions to use this name.
    //
    // Caution: for parsing efficiency reason, do not use another variable with the same name
    var arequire = require('nway/arequire')(require);

    console.log('index.js: For demo purposes, I export my application object');

    var application = module.exports = {

      goFoo: function(callback) {
        console.log('index.js: goFoo(). Asynchronously require foo.js. This is an application split point.');
        arequire('./foo.js', function(err, foo) {
          console.log('index.js: foo.js is imported. Execute its exported function foo().');
          foo();
          callback && callback();
        })
      }


      ,goBar: function(callback) {
        console.log('index.js: goBar(). Asynchronously require bar.js. This is an application split point.');
        arequire('./bar.js', function(err, bar) {
          console.log('index.js: bar.js is imported. Execute its exported function bar().');
          bar();
          callback && callback();
        })
      }
    }


    console.log('index.js: Go into the FOO part of the application:');
    application.goFoo(function() {

      console.log('index.js: Now go into the BAR part of the application:');
      application.goBar();

    });

**src/foo.js:**

    // foo.js

    console.log("foo.js: I am a huge part of the application and I export a function");

    module.exports = function() {
      console.log("foo.js: I am executed");
    }

**src/bar.js** looks like foo.js


*You can run `node src/index.js` to see what happens when execute in server-side mode with node*

  - `index.js` creates an `arequire()` for is module and then creates an application with some methods that asynchronously require other modules
  - `index.js` loads the FOO part of the application.
  - Once the FOO part is loaded, `index.js` loads the BAR part of the application

**Run nway to generate the client version**
*Note: We do not specify `index.js`, this is redundant in node since `src` is a folder with an `index.js` inside!*

    nway src

**Open `public/index.html`** in your browser (`open public/index.html`), the output in your javascript console is the same of the pure nodejs execution of our application: `node src`:

    index.js: I get a arequire() function for my module
    index.js: For demo purpose, I export my application object
    index.js: Go in the FOO part of the application:
    index.js: goFoo(). Asynchronously require foo.js. This is an application split point.
    foo.js: I am a huge part of the application and I export a function
    index.js: foo.js is imported. Execute it exported function foo().
    foo.js: I am executed
    index.js: Now go in the BAR part of the application:
    index.js: goBar(). Asynchronously require bar.js. This is an application split point.
    bar.js: I am a huge part of the application and I export a function
    index.js: bar.js is imported. Execute it exported function bar().
    bar.js: I am executed

**Great but what is the difference ?**

If you look at the `public/generated` folder, there are 4 files:

    public/generated
     ├╴▫ B70FBF6B67B040FD.js (bar.js)
     ├╴▫ B70FBF6B94EE0B24.js (foo.js)
     ├╴▫ B70FBF6BD1CB26E3.js (index.js and nway arequire generator)
     └╴▫ bootstrap.nocache.js

This is the nway splitting effect!

  - One bundle contains the main module `index.js` but there is nothing else inside (except a very small nway module: the arequire function generator).
  - The two other bundles contains `foo.js` and `bar.js` and are loaded only when the application needs them.


## Asynchronously require many modules ? ###

### Solution 1: pack your multi-dependency into a module ####

**foo.js** needs **a.js** and **b.js** to be asynchronously loaded before it can execute a function (the AMD way would be `require(['a','b'], function (a, b) {})`)

Create a **bundle_ab.js** that exports **a.js** and **b.js**:

    module.exports = { a: require('./a'), b: require('./b')};

Now in **foo.js** you can do:

    arequire('./bundle_ab', function(error, results) {
      // Now you have results.a and results.b ...
    })

### Solution 2: just do it async ! ####

Many javascript libraries such as [async.js](https://github.com/caolan/async) or [queue.js](https://github.com/mbostock/queue) simplify this asynchronous pattern: You control exactly what you do and you can re-use the usefull patterns of this library in your application without the need to reload it.

**foo.js** with async:

    var async = require('async'), arequire = require('nway/arequire')(require);

    async.parallel([
       function(done) { arequire('./a.js', done)}
      ,function(done) { arequire('./b.js', done)}
    ]
    , function(results) {
        // Now you have results.a and results.b ...
    })

<a name="substitute"></a>
# Module substitution ##

Some times you need to substitute a server-only module by a browser-compatible module.

There are many reasons to prevent yourself from doing this: even for testing where using headless browser is a much better solution to test browser-only modules.

In some cases you have no choice: for example, if you are using an external package that require a server-side-only module that is easy to override for browser side.

**See module substitution sample in [substitute.demo.js](#demo/03_substitute/substitute.demo.js)**

<a name="middleware"></a>
<a name="cache_optimisation"></a>

# Cache optimisation and nway middleware() ##

nway's cache optimisation is based on:

  - nway middleware. It applies http cache optimisation on nway-generated content.
  - Generated bundle-file naming. A hash-name is used based on: nway version, compilation options and bundle content.
  - A very tiny bootstrap script, never cached, that drives bundle loading

Exemple: consider the following `public/generated` folder:

    public/generated
     ├╴▫ bootstrap.nocache.js
     ├╴▫ CDC551BB0420A359.js
     ├╴▫ CDC551BB18A726CD.js
     ├╴▫ CDC551BB1A74CB97.js
     ├╴▫ CDC551BB29E43756.js
     ├╴▫ CDC551BB5FCDA7AD.js
     └╴▫ CDC551BB822417A8.js

**`bootstrap.nocache.js` is the only file explicitly included in you web page**:
This file contains a script loader that knows which file contains the required application modules. The bootstrap is very small, and change as the application changes: that is why the client browser must **never keep it in cache**.

** Files like `CDC551BB0420A359.js` contains the application modules**:
The first 8 chars `CDC551BB` change depending on nway's options and version number: that is why many files begin with this string. The last 8 chars `0420A359` change with the modules contents.

**To summarize:**

  - The bootstrap must never be cached (or, at least, it can be a http 304 response).
  - The bundles are naturally cachable for life.

**The nway middleware does exactly that**: it explicitly forces the http header obtain this effect (caching all generated bundles by the bootstrap). But you could do the same with any http server.

**Exemple with a small connect.js driven http server:**

     var connect = require('connect')
       , http    = require('http')
       , nway  = require('nway')
     ;

     // The options consumed by nway.middleware()
     // must be the same than the ones used for compilation
     // (at least the 'bootstrap', 'client' and 'extension' keys)
     var options = {client:'/generated', bootstrap: 'bootstrap.nocache.js', extension: '.js'};

     var app = connect()
        .use(nway.middleware(options))
        .use(connect.static('public')) // Path to public files
        .listen(3000);

     http.createServer(app).listen(3000);

Your app is now served on http://localhost:3000/

# Limitations ##

### Dynamic require & arequire module argument is not *yet* allowed *(may be one day... or may be not)*:

    // You can't yet do this kind of things:
    var foobar = 'foobar';
    require(foobar);

    // Or this:
    var x = 'foo';
    require('module_' + x);

    // Or this:
    ['a','b'].forEach(function(m) { require(m) });

    // Or this:
    async.map(['a','b'], arequire, function(err, results) {});

### Variable re-affecting for require or arequire:

    // You can't do this:
    var arequire = require('nway/arequire')(require);
    var split    = arequire;
    split('./a.js', function() {}) // Ok in nodejs but this won't work on browser side !

    // Nor this:
    var r = require;
    r('path'); // Ok in nodejs but this won't work on browser side !

### Using server-only package: ###

  - nway can use alternative to node builtin packages (`event`, `path`, etc.). However some packages, such as node `fs`, can only be executed on server side (nway is compatible with browserify packages).
  - All packages that uses C++ compiled modules... can't be compiled by nway to be run in the browser.

Anyway, when you experience this kind of needs, consider reviewing in your application design. If after that your needs persist, consider using [`options.substitute`](#substitute) to provide a browser-alternative module.


<a name="cmd"></a>
# Command line

## Usage:

    $ nway --help

    Usage: nway [options] <index>

    Options:

      -h, --help                output usage information
      -V, --version             output the version number
      -b, --bootstrap [string]  Bootstrap file path [bootstrap.nocache.js]
      -c, --client [string]     Client relative path to load module packages [./generated]
      -e, --extension [string]  Extension to append to generate package [.js]
      -f, --force               Force compilation, even if the destination file exist@[false]
      -m, --nomangle            Do not mangle names (used only with --uglify) [false]
      -o, --output [string]     Output path for generated module packages [./public/generated]
      -p, --prepend [string]    Prepend all generated script with a string [null]
      -n, --norun               Do not run entry point automaticaly when DOM is ready [false]
      -s, --nosqueeze           No deep optimization (used only with --uglify) [false]
      -u, --uglify              Uglify source using Uglify.js [false]
      -y, --beautify            Generate human readable source (used only with --uglify) [false]
      --onepack                 Pack all modules in a standalone source and send the result on the standards output  [false]

## ZSH Completion ###

To enable zsh completion add this in any zsh configuration file: `compdef _gnu_generic nway`


## Play with command line & demo ###

Go in the demo folder:

    cd demo

Execute nway without options, just choose the application main module as entry point:

    nway src/index.js

Now in the `public/generated` folder contain the files generated by nway:

    public/generated
     ├╴▫ 15986D7A18A726CD.js
     ├╴▫ 15986D7A214696ED.js
     ├╴▫ 15986D7A822417A8.js
     ├╴▫ 15986D7A8ECD6654.js
     ├╴▫ 15986D7AF2AEA598.js
     ├╴▫ 15986D7AF395D729.js
     └╴▫ bootstrap.nocache.js

Every time you change a file content, or any nway options, the generated file names change.

Then open the demo in a navigator:

    open public/index.html

Now, you can play with the demo application:

  - Click on buttons to start a part of the application
  - In the debug output (or your browser console) you can see the bundles loaded by nway.

You can do more things by using your browser javascript console (developper tool):

  - Get the entry point: `var ep = require('/')`
  - Then play with your entry point object: `ep.voronoi()`, `ep.load('underscore', function(_) {alert(_)})`, ...

## Debug information ###

nway uses [debug](https://github.com/visionmedia/debug) to output some debug information.

To show debug information, add `DEBUG='nway*'` before any command or script that uses nway:

    DEBUG=nway* nway src/index.js -f

(`-f` is used to force nway to re-generate all files)


## Play with some command line options ###

<a name="uglify"></a>
### -u, --uglify & co

With the option `uglify`, the generated sources are optimized and minimized with [UglifyJS](https://github.com/mishoo/UglifyJS):

    nway src/index.js -u

If you look at the generated sources in `public/generated`, you can see that all the sources are deeply optimized.

Generating sources using uglify takes much much longer (at least the first time). Consider using this optimization for production compilation only.

Some other options can alter uglify behaviours:

  - `-m, --nomangle`: Keep original variable and function names
  - `-s, --nosqueeze`: Disable deep source optimizations process
  - `-y, --beautify`: Add indentation and line return to make generated source human readable.

### -p, --prepend [string]

Prepends all generated files with the given string (such a copyright notice):

    nway src/index.js -p '// Copyright Foobar'

### --onepack ###

Forces nway to bundle all the generated bundles in one single bundle. When you use the `--onepack` options, nway do not write anything to the disk, instead it writes the compilation result to the standard output.

This is usefull when you do not want a bootstrap file and you do not care of application splitting (to dump the script in a standalone html file for instance).

    nway src/index.js --onepack > mypack.js

<a name="api"></a>



# JavaScript API

This is the common usage of nway. For details, please read the API documentation.

    var nway = require('nway');


    nway({
      // Generated file destination (absolute or relative path
      // to the current working directory)
        output      : './public/generated'

      // Client url to the generated files (relative or absolute url)
      , client      : './generated'

      // The bootstrap file name (*.nocache.* pattern may be used to force static
      // file server to disable cache)
      , bootstrap   : 'bootstrap.nocache.js'

      // Globals are used for script optimisation : those variable
      // are scoped in each bundle to reduce file size when using
      // uglify to mangle variable names
      , globals     : 'window, document, console, require'

      // The entry point (absolute or relative path to the
      // current working directory)
      , index       : './index.js'

      // Generated packed file extension
      , extension   : '.js'

      // Do not automaticaly run main entry point (the index) when the DOM is ready
      // (you have to do require('/') by your self when the dom is ready)
      , norun         : false

      // Optimise source with uglify
      , uglify      : false

      // Uglify option : do not mangle names
      , nomangle    : false

      // Uglify option : do not do deep source optimisation
      , nosqueeze   : false

      // Uglify option : generate readable source (comments are
      // allways removed with uglify)
      , beautify    : false

      // Force re-generation even if a generated file allready exist with
      // the same hash
      , force       : false

      // Prepend all the generated file with this string (maybe a copyright)
      , prepend     : null

      // core & node_modules remplacements
      //
      // Node.js core & node_modules remplacement are resolved using the following process :
      //
      // - Check for an alternative in options.alternative : { 'package-name': 'alternative-package-name'}
      // - Check for a browserify alternative : {'http': 'node_modules/http-browserify'}
      // - Check for a nway alternative : {'http': 'node_modules/http-nway'}
      //
      , alternative : {}

      // Replace a file path resolved by another file path path
      , substitute  : {}

      // Alias list :
      //
      //   keys = module alias
      //   value = module resolvable filepath
      //
      // nway provide a default alias for main module (entry point) : '/'
      //
      // You may define alias to manualy doing a require('myAlias') a module
      // in the browser. Remember nway hide the real module path in generated sources
      // as long as you not explicitly provide an alias to them.
      , alias       : {}

      // Used to force re-generation of bundle files when nway version
      // has change (as the options are used to generate global uniq id)
      , version     : require('../package.json').version

      // To change global uniq id
      , catkeyboard : ''



      // Array of patterns of filepath to exclude form parsing
      // Use it to enhance compilation speed on allready bundled source without
      // any commonjs mechanism inside.
      //
      // Allowed values are :
      //   - string : Used as a minimatch pattern on absolute file path
      //   - regexp : Used to test absolute file path
      //   - function : Receive the absolute file path and the Module object. Returns a boolean.
      , noparse     : []

      // Exclude some dependency from the generation process
      // You will have to add those dependencies by your self using require.define()
      // Exclude is an array of minimatch (https://github.com/isaacs/minimatch) wildcards
      , excludes    : []


      // compress is a compression function.
      // default is nway.defaultCompressor (based on uglify)
      , compress    : null

      // prewrite is a function to execute on the source before
      // write to disk : the function receive a source, and an object
      // The object may be (instanceof) : an nway/lib/Bootstrap or a nway/lib/DepNode (bundle)
      // This function MUST always return a source
      , prewrite    : null

      // Use the onepack builder : all the modules bundled in one source (ignore async splitter)
      , onepack     : false

      // Parsers :
      // an hash of extra parser objects :
      //
      //    - match : minimatch pattern or regex on module filepath or function (with the same
      //      arguments passed to the parse function listed below)
      //    - parse : Parser function that return the parsed (and transformed) source
      //      (see nway/lib/parsers/*) for exemples
      //
      // The parse function used in main nway parser is the one with a `match`
      // pattern that suceed on the filepath
      //
      // Each `parse` function receive those arguments :
      //
      //    - src  (string)   : Source to parse and transform
      //    - module (object) : Module object created by the main parser function
      //    - makeModule (function): Main parser module creator : receives an absolute
      //                        filepath to parse, and return a new Module object.
      //    - options (object): An nway options object
      //
      // And return a parsed (and some time transformed) source
      //
      // nway defaults parsers (in nway/lib/parsers) :
      //
      //   - commonjs javascript source (.js)
      //   - json source (comments allowed) (.json)
      //
      , parsers  : []
    })



# License

(The MIT License)

Copyright (c) 2012-2013 Novadiscovery <osproject@novadiscovery.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
