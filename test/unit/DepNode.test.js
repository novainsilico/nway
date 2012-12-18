// -----------------------------------------------------------------------------
// Copyright © 2011-2012 Novadiscovery. All Rights Reserved.
// -----------------------------------------------------------------------------

var DepNode   = (process.env.TEST_COV ? require('../../lib-cov/DepNode')   : require('../../lib/DepNode'))
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


describe('DepNode', function(){
	it('should instantiate ...', function(){
		(function() {
			new DepNode('nodeuid', options);
		}).should.not.throw();
	})

	it('should throw if uid is not given', function(){
		(function() {
			new DepNode();
		}).should.throw();
	})

	it('should throw if invalid nway object given', function(){
		(function() {
			new DepNode('uid', {});
		}).should.throw();
	})

	describe('#removeChild()', function(){
		it('should remove a child from a node', function() {
			var nodeA = new DepNode('a', options);
			var nodeB = new DepNode('b', options);
			nodeA.appendChild(nodeB);
			nodeA.removeChild(nodeB);

			nodeA.children.should.not.include(nodeB);
			should.not.exist(nodeB.parent);

		})
	})


	describe('#appendChild()', function(){
		it('should append a child to a node', function() {
			var nodeA = new DepNode('a', options);
			var nodeB = new DepNode('b', options);
			nodeA.appendChild(nodeB);
			nodeA.children.should.include(nodeB);
		})

		it('should set the child node parent', function() {
			var nodeA = new DepNode('a', options);
			var nodeB = new DepNode('b', options);
			nodeA.appendChild(nodeB);
			nodeB.parent.should.equal(nodeA);
		})

		it('should remove the node from is previous parent first', function() {
			var nodeA     = new DepNode('a', options);
			var nodeB     = new DepNode('b', options);
			var nodeZ     = new DepNode('z', options);

			// Append b to a
			nodeA.appendChild(nodeB);
			nodeA.children.should.include(nodeB);
			nodeB.parent.should.equal(nodeA);

			// Append b to another parent :
			nodeZ.appendChild(nodeB);

			// New parent check
			nodeB.parent.should.equal(nodeZ);
			nodeZ.children.should.include(nodeB);

			// Not any more in previous parent
			nodeA.children.should.not.include(nodeB);
		})
	})

	describe('#hasModule()', function() {
		it('should return true if the node contain the given module (by id)', function() {
				var nodeA = new DepNode('a', options);
				nodeA.modules.push(new Module({uid:'test'}));
				nodeA.hasModule('test').should.be.true;
				nodeA.hasModule('foobar').should.be.false;
		})
	})

	describe('#removeModule()', function() {
		it('should remove the given module (by id)', function() {
				var nodeA = new DepNode('a', options);
				nodeA.modules.push(new Module({uid:'test'}));
				nodeA.removeModule('test');
				nodeA.hasModule('test').should.be.false;
		})
	})

	describe('#addModule()', function() {
		it('should add the given module (module object)', function() {
				var nodeA = new DepNode('a', options);
				nodeA.addModule(new Module({uid:'test'}));
				nodeA.hasModule('test').should.be.true;
		})
	})

	describe('#getBranchModules()', function() {
		it('should return all modules in the current node and it children', function() {
				var nodeA = new DepNode('a', options);
				var nodeB = new DepNode('b', options);
				var nodeC1 = new DepNode('c1', options);
				var nodeC2 = new DepNode('c2', options);

				nodeA.appendChild(nodeB);
				nodeB.appendChild(nodeC1);
				nodeB.appendChild(nodeC2);

				nodeA.addModule(new Module({uid:'test1'}));
				nodeA.addModule(new Module({uid:'test2'}));

				nodeB.addModule(new Module({uid:'test3'}));
				nodeB.addModule(new Module({uid:'test4'}));

				nodeC1.addModule(new Module({uid:'test5'}));
				nodeC1.addModule(new Module({uid:'test6'}));

				nodeC2.addModule(new Module({uid:'test7'}));
				nodeC2.addModule(new Module({uid:'test8'}));

				_.pluck(nodeA.getBranchModules(),'uid').should.eql(['test1','test2','test3','test4','test5','test6','test7','test8'])

		})
	})
})
