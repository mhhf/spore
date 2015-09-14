var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

chai.should();
var working_dir = __dirname+'/.scenarios/b';

describe('spore#uninstall', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'b' )
    
    init({
      cli: false,
      working_dir
    });
    require('../src/lib/install.es6')( {
      working_dir,
      package_name: 'a'
    });
    
  });
  
  after( function() {
    scenarios.cleanup();
  });
  
  it("should remove a dependency", function(done){
    
    require('../src/lib/uninstall.es6')( {
      working_dir,
      package_name: 'a'
    });
    
    var pkg = require('../src/lib/package.es6')( {
      working_dir
    });
    
    pkg.json.ignore.length.should.eql(0);
    pkg.json.dependencies.should.not.have.a.property('a');
    
    done();
  });
  
  it("should remove nested dependencies");
  it("should keep nested dependencies, needed by other dependencies");
  
});
