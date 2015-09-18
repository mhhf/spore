var web3    = require('web3');
var deasync = require('deasync');


var Spore = function ( host, port, address ){
  // var settings = require("../../config/app.json");
  
  web3.setProvider(new web3.providers.HttpProvider(`http://${host}:${port}`));
  web3.eth.defaultAccount = web3.eth.coinbase;

  var sporeContract = require('../../config/production/contracts.json').Spore;

  // var address = sporeContract.address;
  var abi = sporeContract['abi'];

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

module.exports = Spore;
