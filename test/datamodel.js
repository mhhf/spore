var mocha = require('mocha');
var chai = require('chai');
var should = require('should');
var tv4 = require('tv4');

var schema = require('../src/spec.json');
chai.should();


describe('datamodel', function() {
  
  it("example package should be valide", function(done){
    
    var example = {
      name: "namespace1:Coin",
      version: "0.0.1",
      description: "Coin is a simple altcoin which gives the contract creator\n a fixed amount. \n\n No additional functions are implemented.",
      dependencies: {
        "ethereum:metacoin": "0.1.0"
      },
      dagNode: "QmRSKgxMc2Hds1CFGjkpzyYEMuFrNMrPW75fLHFq752B2d"
    };
    
    var validation = tv4.validate( example, schema );
    
    if(!validation) throw new Error(tv4.error);
    
    (validation).should.be.true;
    
    done();
    
  });
  
  
});
