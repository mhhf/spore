
var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

chai.should();

var working_dir = __dirname+'/.scenarios/b';

describe('spore#install', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'b', 'a' )
    init({
      cli: false,
      working_dir
    });
  });
  

  after( function() {
    scenarios.cleanup();
  });
  
  it("should install a simple package", function(done){
    
    
    require('../src/lib/install.es6')( {
      working_dir,
      package_name: 'a'
    });
    
    var pkg = require('../src/lib/package.es6')( {
      working_dir
    });
    
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
