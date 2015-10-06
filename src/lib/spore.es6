var deasync = require('deasync');
var colors  = require('colors');


var Spore = function ( config, address ){
  // var settings = require("../../config/app.json");

  var Contract = require('../../contract.json').Spore;

  var address = Contract.address;
  var abi = Contract.abi;
  
  
  if( config.web3().eth.getCode( address ) === "0x" ) {
    console.log(`No Spore contract found at ${address}`.red);
    process.exit();
  }

  var instance = config.web3().eth.contract(abi).at(address);
  
  var getOwnerSync         = deasync( instance.getOwner );
  var registerPackageSync  = deasync( instance.registerPackage );
  var getLinkSync          = deasync( instance.getLink );
  var getNumPackagesSync   = deasync( instance.numPackages );
  var getPackageName       = deasync( instance.packagesArray );
  // var getPackagesArraySync = deasync( instance.getLink );
  
  var getPackagesArraySync = function() {
    var num = getNumPackagesSync();
    var obj = {};
    
    for ( var i = 0; i< num; i++ ) {
      var name = config.web3().toAscii(getPackageName(i));
      var head = getLinkSync(name);
      obj[name] = head;
    }
    return obj;
  }
  
  return {
    instance,
    getOwnerSync,
    getLinkSync,
    registerPackageSync,
    getPackagesArraySync,
    getNumPackagesSync
  };
}

module.exports = Spore;
