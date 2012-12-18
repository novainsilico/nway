//
// TODO: Clean up and enhancements
//

var require = (function() {


	// For debug : trace who require who
	var loadFrom = null; // TODO cleanup

/**
 * The global require function object
 *
 * The require function is the only global variable
 *
 * @param  {string} uid Uniq ID of the module to load
 * @return {mixed}      The value exported by the module
 * @throws {Error} If module not found
 */
	function require(uid) {
		var r   = require;
		uid     = r.alias[uid] || uid;
		var mod = r.modules[uid];
		if (!mod) throw new Error('Failed to resolve module ' + uid);
		var res = mod._cached ? mod._cached : mod();
		return res;
	}

	// Modules list
	require.modules = {};

	// Alias list (template injected)
	require.alias   = {{alias}};

	// Require is loaded
	require.loaded        = false;


/**
 * Add a function to execute after require is ready
 * to handle calls
 *
 * Calls to require are stored and executed after
 * require is ready to handle those calls
 *
 * @param  {function} func The function to execute on require ready
 */
	require.onReady       = function(func) {
		if(require.loaded) return func();
		require.onReady.stack.push(func);
	}

	// On ready stack :
	require.onReady.stack = [];

/**
 * Add a function to execute every time a ressource is loaded
 *
 * @param  {function} func The function to execute on load
 *
 */
	function addOnLoadHandler(func) {
		console.log('addOnLoadHandler');
		addOnLoadHandler.stack.push(func);
	}

	// On ready stack :
	addOnLoadHandler.stack = [];


/**
 * The commonjs module definer
 *
 * @param  {string}   uid Uniq module ID
 * @param  {Function} fn  The module definition function (see ./body.js)
 * @return {[type]}       [description]
 */
	require.define   = function (uid, fn) {
		// The fake direname
		var dirname  = '/';

		// The dedicated require function object
		// for the module
		var require_ = function (uid) {
			return require(uid)
		};

		// Main require module list
		require_.modules = require.modules;

		// Main require define function
		require_.define  = require.define;

		// Main require alias list
		require_.alias   = require.alias;

		// Local require loader
		require_.loader  = {};

		// Local require loader.load method with who require who tracker
		require_.loader.load = function() {
			console.log(uid);
			loadFrom = uid;
			return require.loader.load.apply(require.loader, arguments);
		}

		// For debug purpose : add on load handler
		require_.addOnLoadHandler = addOnLoadHandler;

		// Local module with module exports object
		var module_ = { exports : {} };

		// Add module to the require module list
		// with exported value caching
		require.modules[uid] = function () {
			require.modules[uid]._cached = module_.exports;
			fn.call(
				module_.exports,
				require_,
				module_,
				module_.exports,
				dirname,
				uid
			);
			require.modules[uid]._cached = module_.exports;
			return module_.exports;
		};
	};


/**
 * The main require loader object creation
 */
	require.loader = (function() {

		// Injected config object
		var config = {{config}};

		// store the path allready loaded
		var isAllreadyLoaded  = {};

/**
 * Loader constructor
 */
		function DL() {
			var me = this;
			var loaded = false;

			var load = function() {
				if(loaded) return;
				loaded = true;
				me.load(config.main, function() {
					if(!config.norun) require('/');
					require.loaded = true;
					runLoadStack();
				});
			}
			try {
				window.addEventListener('load', load );
			} catch(e) {}
			try {
				window.addEventListener('DOMContentLoaded', load );
			} catch(e) {}

			try {
				window.attachEvent('onload', load);
			} catch(e) {}


		};

/**
 * Call all the 'onReady' waiting functions (some async require that
 * waiting for require to be able to handle those calls)
 *
 * @api private
 */
		function runLoadStack() {
			var func;
			while(func = require.onReady.stack.shift()) {
				func();
			}
		}

		{{loader}}

		// Instance and return
		return new DL();
	})();

	{{allmodules}}

	return require;

})();