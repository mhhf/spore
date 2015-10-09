// var emulator = require('./emulation.es6')();
var deasync = require('deasync');

// Test if the contract @addr is the deployed binary
// @return boolean
var isContract = function( addr, bin ) {
  
  var code = config.web3().eth.getCode( addr );
  var sha3 = config.web3().sha3(code, true);
  
  
  
  var code_2 = emulator.execInitSync( bin );
  var sha3_2 = config.web3().sha3( "0x"+code_2, true)

  console.log( sha3 === sha3_2 );
}


module.exports = function( config ) {
  
  // TODO - only add, if not already added
  var pkg = config['<package>'];
  if( pkg.length <= 32 ) { // Not IPFS - hash 
    pkg = config.contracts.spore().getLinkSync( pkg );
  }
  
  // TODO - resolve contract name
  var contract = config['<contract>'];
  // If no contract was given, assume that there is just one contract
  // TODO - error handler if there are more contracts
  var pkgO = config.ipfs().catJsonSync( pkg );
  if ( !contract ) contract = Object.keys(pkgO.contracts)[0];
  
  var addr = config['<address>'];
  
  var bin = require('../../contract.json').Spore.binary;
  
  var tx = config.contracts.instance().add( pkg, contract, addr, { gas: 700000 }  );
  
  
  // config.web3().eth.getTransactionReceipt( tx );
  
}
