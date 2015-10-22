var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var CONFIG      = require('../src/lib/config.es6');
var add         = require('../src/lib/add.es6');
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

chai.should();
var working_dir = __dirname+'/.scenarios/b';


var config = CONFIG({ working_dir }, {cli: false, test: true});

describe('spore#uninstall', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'b' )
    
    init( config );
    config['<package>'] = 'a';
    
    require('../src/lib/install.es6')( config );
    
  });
  
  after( function() {
    scenarios.cleanup();
  });
  
  it("should remove a dependency", function(done){
    
    require('../src/lib/uninstall.es6')( config );
    
    config.pkg().json.ignore.length.should.eql(0);
    config.pkg().json.dependencies.should.not.have.a.property('a');
    
    done();
  });
  
  it("should remove nested dependencies");
  it("should keep nested dependencies, needed by other dependencies");
  
});
