var web3    = require('web3');
var deasync = require('deasync');


var Spore = function ( ){
  
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
  web3.eth.defaultAccount = web3.eth.coinbase;

  var sporeContract = require('../contracts.json').contracts.Spore;

  var address = '0xf8547bb87e48018eac009b14327a60341b3a913d';
  var abi = JSON.parse( sporeContract['json-abi'] );

  var instance = web3.eth.contract(abi).at(address);
  
  var getOwnerSync        = deasync( instance.getOwner );
  var registerPackageSync = deasync( instance.registerPackage );
  var getLinkSync         = deasync( instance.getLink );
  
  return {
    instance,
    getOwnerSync,
    getLinkSync,
    registerPackageSync
  };
}

module.exports = Spore();
