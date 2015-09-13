var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var tv4         = require('tv4');
var fs          = require('fs-extra');

var init        = require('../src/lib/init.es6');
var working_dir = __dirname+'/scenarios/a';


describe('init', function() {
  
  it("should init the right spore.json", function(done){
    
    init({
      cli: false,
      working_dir
    });
    
    var json = require(`${working_dir}/spore.json`);
    var spec = require('../src/user_spec.json');
    
    var valide = tv4.validate( json, spec );
    
    valide.should.be.True;
    
    done();
  });
  
});
