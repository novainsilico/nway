/**
 * Load a client pack
 * 
 * @param  {string}   path     pack path
 * @param  {Function} callback Callback function that receive an error object
 */
		DL.prototype.load = function(path, callback) {
			path = require.alias[path] || path;

			callback = callback || function() {};

			// Cached :
			if(isAllreadyLoaded[path]) return callback();

			// retrieve hash :
			var hash = findHash(path);
			if(!hash) throw "Hash not found for path " + path;

			var client = config.client;
			var url = client + (client.length && !/\/$/.test(client) ? '/' : '')  + hash + config.extension;

			// Call on load handlers
			function fireOnLoad() {
				var args = arguments, i;
				for(i = 0, len = addOnLoadHandler.stack.length; i<len; i++) {
					addOnLoadHandler.stack[i].apply(null, args);
				}
			}
			fireOnLoad({
				 path: path
				,hash: hash
				,url:  url
				,from: loadFrom
			});

			scriptLoader(url, function(err) {
				if(err) {
					return callback(err);
				}
				isAllreadyLoaded[path] = true;
				// Allow arequire callback to do sync require :
				callback();
			});
		};

/**
 * Find the pack hash for the given path
 * @param  {string} path The path to resolve
 * @return {string}      The hash for the path
 * @api private
 */
		function findHash(path) {
			var h, m, len;
			for(h in config.map) {
				var modules = config.map[h];
				for(m = 0, len = modules.length; m < len; m++ ) {
					if(modules[m] === path) return h
				}
			}
			return null;
		}


/**
 * The script loader
 *
 * Load a packed script and return to the callback the resulting
 * value
 * 
 * @param  {string}   url      The packed script url
 * @param  {Function} callback A callback function that receive and error object
 */
		function scriptLoader(url, callback) {

			var doc         = document, s = doc.createElement("script")
			  , head        = doc.getElementsByTagName("head")[0]
			  , node
			  , done        = false;
			;

			// On success listener
			function onScriptLoad() {
				if ( !done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") )
				{
					done     = true;
					callback();
				}
			}

			// On failure listener (callback receive an error false)
			function onScriptError() {
				callback(new Error("Packet loading error for " + url));
			}

			// Create the script tag
			node         = document.createElement('script')
			node.type    = config.scriptType || 'text/javascript';
			node.charset = 'utf-8';
			node.async   = true;

			// Listen to the onload event
			if (node.attachEvent &&
					!(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0)) {
				node.attachEvent('onreadystatechange', onScriptLoad);
			} else {
				node.addEventListener('load', onScriptLoad, false);
				node.addEventListener('error', onScriptError, false);
			}

			// Set the src value with the packed script url
			node.src = url;

			// Start loading by adding the script tag in the head
			head.appendChild(node);

		}