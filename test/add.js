var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');
var PKG         = require('../src/lib/package.es6');

chai.should();
var working_dir = __dirname+'/.scenarios/a';
var home = process.env.HOME || process.env.USERPROFILE;
var env = require( home + '/.spore.json' );
var config = require( '../src/lib/config.es6' )( env );

describe('spore#add', function() {
  
  
  before( function() {
    
    scenarios.setupAll();
    scenarios.setup( 'a' );
    init({
      cli: false,
      working_dir
    });
    
    var pkg = PKG( _.extend({}, config, {working_dir}) );
    _.extend( config, {pkg} );
    
  });
  
  after( function() {
    scenarios.cleanup();
  });
  
  it("should add a non contract file", function(done){
    
    var path_to_file = 'readme.md';
    fs.writeFileSync( working_dir + '/' + path_to_file, '# title' );
    
    add(_.extend({
      cli: false,
      working_dir,
      path_to_file
    }, config));
    
    var pkg = require('../src/lib/package.es6')( _.extend({
      working_dir
    }, config));
    
    pkg.json.files[0].should.eql( path_to_file );
    
    done();
  });
  
  // TODO - test add dirs
  
  it("should add contract files and contained contract to json", function(done){
    
    var path_to_file = 'contracts/a.sol';
    
    add( _.extend({
      cli: false,
      working_dir,
      path_to_file
    }, config));
    
    var pkg = require('../src/lib/package.es6')( _.extend({
      working_dir
    }, config));
    
    pkg.json.contracts[0].should.eql( 'a' );
    
    done();
  });
  

  
  
});
