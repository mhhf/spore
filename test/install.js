
var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

var home = process.env.HOME || process.env.USERPROFILE;
var config = require( home + '/.sporerc.json' );

chai.should();

var working_dir = __dirname+'/.scenarios/b';

describe('spore#install', function() {
  
  before( function() {
    
    scenarios.setupAll();
    
    var working_dir_a = __dirname+'/.scenarios/a';
    
    // PUBLISH A
    scenarios.setup( 'a' )
    init({
      cli: false,
      working_dir: working_dir_a
    });
    
    var path_to_file = 'contracts/a.sol';
    
    add(_.extend({
      cli: false,
      working_dir: working_dir_a,
      path_to_file
    },config));
    
    var hash = require('../src/lib/publish.es6')( _.extend({
      cli: false,
      working_dir: working_dir_a
    }, config));
    
    
    scenarios.setup( 'b', 'a' )
    init(_.extend({
      cli: false,
      working_dir: working_dir
    }, config));
  });
  

  after( function() {
    scenarios.cleanup();
  });
  
  it("should install a simple package", function(done){
    
    
    require('../src/lib/install.es6')( _.extend({
      working_dir,
      package_name: 'a'
    }, config));
    
    var pkg = require('../src/lib/package.es6')( _.extend({
      working_dir
    },config));
    
    // Should have a as a dependency
    pkg.json.dependencies.should.have.a.property('a');
    pkg.json.ignore.indexOf('contracts/a.sol').should.be.above(-1);
    
    done();
  });
  
  it("should install nested dependencies");
  it("should install multiple dependencies");
  it("should throw an error on circular dependencies");
  it("should throw an error on incompatible dependencies");
  
  
});
