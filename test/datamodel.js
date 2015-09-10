var mocha = require('mocha');
var chai = require('chai');
var should = require('should');
var tv4 = require('tv4');

var schema = require('../src/user_spec.json');
chai.should();


describe('datamodel', function() {
  
  it("example package should be valide", function(done){
    
    var example = {
      "name": "std",
      "version": "0.1.0",
      "description": "Standart packages",
      "dependencies": {
        "owned": "QmT7uHnPpU6ALmSwFQT9mCw2tJGHNjg6fDdpLqYXGTtYiR"
      },
      "contracts": {
        "mortal": {
          "abi": [
            {
              "constant": false,
              "inputs": [],
              "name": "kill",
              "outputs": [],
              "type": "function"
            }
          ],
          "natspec": {
            "methods": {}
          }
        }
      },
      "files": [
        "contracts/mortal.sol"
      ],
      "ignore": [
        "/Users/mhhf/work/01_internal/spore/example/mortal/contracts/owned.sol"
      ]
    };
    
    var validation = tv4.validate( example, schema );
    
    if(!validation) throw new Error(tv4.error);
    
    (validation).should.be.true;
    
    done();
    
  });
  
  
});
