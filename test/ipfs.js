var mocha = require('mocha');
var chai = require('chai');
var should = require('should');

// https://github.com/ConsenSys/ipfs.js
var ipfs = require('ipfs-js/ipfs.js');


describe('IPFS', function() {
  
  it("should reach the provider", function(done){
    
    // Setup IPFS
    // ipfs.setProvider({host: 'localhost', port: '5001'});
    ipfs.setProvider(require('ipfs-api')('localhost', '5001'));
    
    done();
  });
  
  it("should add a file", function(done){
    
    ipfs.add("Testing...", function( err, hash ) {
      hash.should.eql('Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt');
      done();
    });
    
  });
  
  it("should resolve a file", function(done){
    
    ipfs.cat('Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt', function( err, text ) {
      text.should.eql('Testing...');
      done();
    })
    
  });
  
  it("should grab a string from the network", function(done){
    
    
    ipfs.cat('QmTkukZw6MBSfGZ2nTubdCsMeoKyNbrNidyGiJMUEh2dCx', function( err, text ) {
      if( err ) throw err;
      
      text.should.be.a('string');
      text.slice(0,6).should.eql('import');
      
      done();
      
    })
    
    
  });
  
});
