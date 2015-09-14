var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

chai.should();

var working_dir = __dirname+'/.scenarios/a';

describe('spore#publish', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'a' )
    init({
      cli: false,
      working_dir
    });
    
    var path_to_file = 'contracts/a.sol';
    
    add({
      cli: false,
      working_dir,
      path_to_file
    });
    
  });
  
  after( function() {
    scenarios.cleanup();
  });
  
  it("should have the correct hash", function(done){
    
    var hash = require('../src/lib/publish.es6')( {
      cli: false,
      working_dir
    });
    
    hash.should.eql('QmU1CxrGNyHA4idkExQgAi7JZmJ1f3zVfWpa76m7LPnBbK');
    
    done();
  });
  
  it("should be a different hash if something change", function(done){
    
    var path_to_file = 'readme.md';
    fs.writeFileSync( working_dir + '/' + path_to_file, '# title' );
    
    add({
      cli: false,
      working_dir,
      path_to_file
    });
    
    var hash = require('../src/lib/publish.es6')( {
      cli: false,
      working_dir
    });
    
    hash.should.not.eql('QmU1CxrGNyHA4idkExQgAi7JZmJ1f3zVfWpa76m7LPnBbK');
    
    done();
  });
  
});
