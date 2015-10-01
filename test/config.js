var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');

chai.should();

var Config = require( '../src/lib/config.es6' );

describe('config', function() {
  
  it("should have an rpc connection and contract specified", function(done){
    
    var config = Config()
    config.should.have.property('chains');
    config.chains[Object.keys(config.chains)[0]].should.have.property('host');
    
    done();
  });
  
  it("should connect to the rpc server", function(done){
    
    var config = Config()
    
    var spore = config.contracts.spore();
    
    done();
  });
  
  it("should connect to the ipfs server", function(done){
    
    
    var config = Config()
    
    var ipfs = config.ipfs();
    
    done();
  });
  
});
