// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

var arequireGenerator = (process.env.TEST_COV ? require('../../lib-cov/arequire') : require('../../lib/arequire'));


var should = require('should')
  , _      = require('underscore')
;

describe('arequire()', function(){

	it('should require a module asynchronously', function(done){
		var arequire = arequireGenerator(require);
		arequire('underscore', function(err, result) {
			result.should.equal(_);
			done();
		})
	})

	it('should return an error when no require function is passed to arequireGenerator', function(){
		(function() {
			var arequire = arequireGenerator();
		}).should.throw();
	})

	it('should return an error when arequire is call without an string path', function(){
		var arequire = arequireGenerator(require);
		(function() { arequire(null); }).should.throw();
	})

	it('should return an error when arequire is call without a callback function', function(){
		var arequire = arequireGenerator(require);
		(function() { arequire('path', null); }).should.throw();
	})

	it('should return an error when the module is not found', function(done){
		var arequire = arequireGenerator(require);
		arequire('notamodule', function(err, result) {
			err.should.be.instanceof(Error)
			done();
		})
	})

})