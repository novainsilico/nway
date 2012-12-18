// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

var templates = (process.env.TEST_COV ? require('../../lib-cov/templates') : require('../../lib/templates'))
;


// IMPORTS
var should = require('should')
	, _      = require('underscore')
	, fpath  = require('../support/fpath')
	, join   = require('path').join
	, fs     = require('fs')
;


describe('templates', function(){
	it('should return predefined templates sources', function(){

		(function() {
			templates.bootstrap.should.be.a('string')
			templates.define.should.be.a('string')
			templates.packet.should.be.a('string')
			templates.loader.should.be.a('string')
			templates.loaderonepack.should.be.a('string')
		}).should.not.throw();

	})

	it('should return predefined templates sources (cache coverage)', function(){

		(function() {
			templates.bootstrap.should.be.a('string')
			templates.define.should.be.a('string')
			templates.packet.should.be.a('string')
			templates.loader.should.be.a('string')
			templates.loaderonepack.should.be.a('string')
		}).should.not.throw();

	})
})