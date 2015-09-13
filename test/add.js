var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

chai.should();
var working_dir = __dirname+'/.scenarios/a';

describe('spore#add', function() {
  
  before( function() {
    // var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    scenarios.setupAll();
    scenarios.setup( 'a' )
    init({
      cli: false,
      working_dir
    });
  });
  
  after( function() {
    scenarios.cleanup();
  });
  
  it("should add a non contract file", function(done){
    
    var path_to_file = 'readme.md';
    fs.writeFileSync( working_dir + '/' + path_to_file, '# title' );
    
    add({
      cli: false,
      working_dir,
      path_to_file
    });
    
    var pkg = require('../src/lib/package.es6')( {
      working_dir
    });
    
    pkg.json.files[0].should.eql( path_to_file );
    
    done();
  });
  
  // TODO - test add dirs
  
  it("should add contract files and contained contract to json", function(done){
    
    var path_to_file = 'contracts/a.sol';
    
    add({
      cli: false,
      working_dir,
      path_to_file
    });
    
    var pkg = require('../src/lib/package.es6')( {
      working_dir
    });
    
    pkg.json.contracts[0].should.eql( 'a' );
    
    done();
  });
  

  
  
});
