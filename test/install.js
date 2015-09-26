
var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var PKG         = require('../src/lib/package.es6');
var add         = require('../src/lib/add.es6');
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');
var CONFIG      = require('../src/lib/config.es6');

var config = CONFIG({}, {cli: false});
config.init();

chai.should();

describe('spore#install', function() {
  
  before( function() {
    
    scenarios.setupAll();
    
    config.working_dir =  __dirname+'/.scenarios/a';
    
    // PUBLISH A
    scenarios.setup( 'a' );
    init( config );
    
    config.initPkg();
    
    
    var path_to_file = 'contracts/a.sol';
    config.path_to_file = path_to_file;
    
    add( config );
    
    var hash = require('../src/lib/publish.es6')( config );
    
    config.working_dir = __dirname+'/.scenarios/b';
    
    scenarios.setup( 'b', 'a' )
    init( config );
    
    config.initPkg();

  });
  

  after( function() {
    scenarios.cleanup();
  });
  
  it("should install a simple package", function(done){
    
    
    config.package_name = 'a';
    require('../src/lib/install.es6')( config );
    
    // Should have a as a dependency
    config.pkg.json.dependencies.should.have.a.property('a');
    config.pkg.json.ignore.indexOf('contracts/a.sol').should.be.above(-1);
    
    done();
  });
  
  it("should install nested dependencies");
  it("should install multiple dependencies");
  it("should throw an error on circular dependencies");
  it("should throw an error on incompatible dependencies");
  
  
});
