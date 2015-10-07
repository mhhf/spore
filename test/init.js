var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var tv4         = require('tv4');
var fs          = require('fs-extra');
var CONFIG      = require('../src/lib/config.es6');

var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');
var working_dir = __dirname+'/.scenarios/a';

var config = CONFIG( { working_dir }, { cli: false } );

describe('init', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup('a');
  });
  
  after( function() {
    scenarios.cleanup();
  });
  
  it("should init the right spore.json", function(done){
    
    init({
      cli: false,
      working_dir
    });
    
    var json = require(`${working_dir}/spore.json`);
    var spec = require(`../src/specs/user_${config.client_version}.json`);
    
    var valide = tv4.validate( json, spec );
    
    valide.should.be.True;
    
    done();
  });
  
});
