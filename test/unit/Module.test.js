// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

var Module    = (process.env.TEST_COV ? require('../../lib-cov/Module')    : require('../../lib/Module'))
;


// IMPORTS
var should = require('should')
  , _      = require('underscore')
  , fpath  = require('../support/fpath')
  , join   = require('path').join
  , fs     = require('fs')
;


describe('Module', function(){

	it('should instantiate ...', function(){
		(function() { 
			new Module();
		}).should.not.throw();
	})

	it('should accept an init object to hydrate', function(){
		var mod = new Module({uid:'test', anything:'test'});
		mod.uid.should.equal('test');
		mod.anything.should.equal('test');
	})

	describe('#getRequired()', function(){

		it('should return all required modules uid', function() {
			var mod = new Module({uid:'test', req: [
				 { uid: 'a', async:false }
				,{ uid: 'b', async:false }
				,{ uid: 'c', async:true }
			]})
			mod.getRequired().should.eql(['a','b','c']);
		})

		it('should return async only required modules uid with argument async argument to true', function() {
			var mod = new Module({uid:'test', req: [
				 { uid: 'a', async:false }
				,{ uid: 'b', async:false }
				,{ uid: 'c', async:true }
			]})
			mod.getRequired(true).should.eql(['c']);
		})

		it('should return sync only required modules uid with argument async argument to false', function() {
			var mod = new Module({uid:'test', req: [
				 { uid: 'a', async:false }
				,{ uid: 'b', async:false }
				,{ uid: 'c', async:true }
			]})
			mod.getRequired(false).should.eql(['a','b']);
		})

	})

	describe('#generate()', function(){
		it('should generate a "define" source for the module', function() {
			var mod = new Module({uid:'test', source: 'var source;'});
			mod.generate().should.be.a('string');
			mod.generate().should.match(/require.define\('test'/);
			mod.generate().should.match(/var source;/);
		})
	})
})
