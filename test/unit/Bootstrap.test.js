// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

var Bootstrap = (process.env.TEST_COV ? require('../../lib-cov/Bootstrap') : require('../../lib/Bootstrap'))
  , DepNode   = (process.env.TEST_COV ? require('../../lib-cov/DepNode')   : require('../../lib/DepNode'))
  , Module    = (process.env.TEST_COV ? require('../../lib-cov/Module')    : require('../../lib/Module'))
;


// IMPORTS
var should = require('should')
  , _      = require('underscore')
  , fpath  = require('../support/fpath')
  , join   = require('path').join
  , fs     = require('fs')
  , options = require('../support/options')
;


describe('Bootstrap', function(){
	it('should instantiate ...', function(){
		(function() { 
			new Bootstrap();
		}).should.not.throw();
	});
	describe('#generate()', function(){

		it('should throw when the tree is empty', function() {
			var bs   = new Bootstrap();
			var node = new DepNode('test', options);
			(function() {
				bs.generate(node, {})
			}).should.throw("The tree must contain, at least, one module")
		});

		it('should generate a valid bootstrap source', function() {
			var bs   = new Bootstrap();

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', options);
			node.modules = [new Module({uid:'test',source:'var source;'})]

			var source = bs.generate(node, {});

			// Contain a require.loader (any)
			source.should.match(/require.loader/);

			// Contain an alias to the main module (test)
			source.should.match(/require.alias *= *\{\"\/\":\"test\"\};/);
		});

		it('should allow the use of another template for the bootstrap', function() {
			var bs   = new Bootstrap();

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', options);
			node.modules = [new Module({uid:'test',source:'var source;'})]

			var source = bs.generate(node, {}, 'other template');

			source.should.match(/other template/);
		});

		it('should allow to extend templates data', function() {
			var bs   = new Bootstrap();

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', options);
			node.modules = [new Module({uid:'test',source:'var source;'})]

			var source = bs.generate(node, {}, 'other template {{alias}} {{other}}', {other: 'otherdata'});

			// Other
			source.should.match(/other template/);
			// Keep alias
			source.should.match(/\{"\/":"test"\}/);
			// Add other data
			source.should.match(/otherdata/);
		});

		it('should add alias to module with options.alias', function() {
			var bs   = new Bootstrap();

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', options);
			node.modules = [
				new Module({
					 uid:    'test'  // Fake id
					,source: 'var source;' // Fake source
					,path:   fpath('lib/client.js') // Real path to a file
				})];


			var source = bs.generate(node, { alias: { 'myalias':fpath('lib/client.js') }})

			// Alias should be resolved and added to alias list :
			source.should.match(/"myalias":"test"/);

		})

		// it('should uglify source if option.uglify is true', function() {
		// 	var bs   = new Bootstrap();

		// 	// Fake tree node + 1 fake module :
		// 	var node = new DepNode('test', options);
		// 	node.modules = [new Module({uid:'test',source:'var source;'})]

		// 	var uglified = bs.generate(node, {uglify:true})
		// 	  , normal   = bs.generate(node, {})
		// 	;

		// 	uglified.should.not.equal(normal);
		// 	uglified.length.should.be.below(normal.length);
		// })

		it('should call options.prewrite with a source and the Bootstrap instance', function() {
			var bs   = new Bootstrap();

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', options);
			node.modules = [new Module({uid:'test',source:'var source;'})]

			var source = bs.generate(node, { prewrite: function(src, obj) {
				src.should.be.a('string');
				obj.should.be.instanceof(Bootstrap);
				return 'modified';
			}})

			source.should.be.equal('modified');
		})

		it('should silently ignore invalid alias destination file', function() {
			var bs   = new Bootstrap();

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', options);
			node.modules = [
				new Module({
					 uid:    'test'  // Fake id
					,source: 'var source;' // Fake source
					,path:   fpath('lib/client.js') // Real absolute path to a file
				})];

			(function() {
				bs.generate(node, { alias: { 'myalias':fpath('lib/invalidpath.js') }})
			}).should.not.throw();

		})

		it('should silently ignore alias to an unfound module', function() {
			var bs   = new Bootstrap();

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', options);
			node.modules = [
				new Module({
					 uid:    'test'  // Fake id
					,source: 'var source;' // Fake source
					,path:   fpath('lib/client.js') // Real absolute path to a file
				})];

			(function() {
				bs.generate(node, { alias: { 'myalias':fpath('lib/a.js') }})
			}).should.not.throw();

		})
	})

	describe('#makePath()', function() {
		it('should return a valid bootstrap filepath based on output and bootstrap options', function() {
			var bs      = new Bootstrap();
			var opt     = _.extend({},{ output: fpath('public'), bootstrap: 'fakebootstrap.js'}, options)
			bs.makePath(opt).should.equal(join(opt.output, opt.bootstrap))
		})
	})

	describe('#write()', function(done) {
		it('should write the generated content to the right path', function(done) {
			var bs      = new Bootstrap();
			var opt     = _.extend({},{ output: fpath('public'), bootstrap: 'fakebootstrap.js'}, options);

			// Fake tree node + 1 fake module :
			var node = new DepNode('test', opt);
			node.modules = [new Module({uid:'test',source:''})]

			var source   = bs.generate(node, opt);
			var filepath = bs.makePath(opt);

			bs.write(node, opt, function(err) {
				if(err) return done(err);
				var wrote = fs.readFileSync(filepath, 'utf8')
				wrote.should.equal(source);
				done();
			})
		})
	})
})
