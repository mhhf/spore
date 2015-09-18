var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var PKG         = require('../src/lib/package.es6');
var add         = require('../src/lib/add.es6');
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

chai.should();
var working_dir = __dirname+'/.scenarios/b';

var home = process.env.HOME || process.env.USERPROFILE;
var env = require( home + '/.sporerc.json' );
var CONFIG = require( '../src/lib/config.es6' );
var cfg = CONFIG( env );
var config;

describe('spore#uninstall', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'b' )
    
    init({
      cli: false,
      working_dir
    });
    
    var pkg = PKG( _.extend({}, cfg, {working_dir}) );
    config = _.extend( {}, cfg, {pkg} );
    
    require('../src/lib/install.es6')( _.extend({
      working_dir,
      package_name: 'a'
    }, config));
    
  });
  
  after( function() {
    scenarios.cleanup();
  });
  
  it("should remove a dependency", function(done){
    
    require('../src/lib/uninstall.es6')( _.extend({
      working_dir,
      package_name: 'a'
    }, config));
    
    config.pkg.json.ignore.length.should.eql(0);
    config.pkg.json.dependencies.should.not.have.a.property('a');
    
    done();
  });
  
  it("should remove nested dependencies");
  it("should keep nested dependencies, needed by other dependencies");
  
});
