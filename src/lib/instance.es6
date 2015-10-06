var deasync = require('deasync');

var Instance = function( config ) {
  
  var Contract = require('../../contract_instance.json').Instance;
  var instance = config.web3().eth.contract( Contract.abi ).at( Contract.address );
  
  var code = config.web3().eth.getCode(Contract.address);
  
  var add = deasync( instance.add );
  var length = instance.length.call;
  var getAt = instance.getAt.call;
  
  var list = function( link ) {
    var arr = [];
    var l = length(link);
    
    for ( var i=0; i<l; i++ ) {
      var ret = getAt( link, i );
      arr.push( {
        name: config.web3().toAscii(ret[0]).replace(/\u0000/g,''),
        addr: ret[1]
      } );
    }
    
    return arr;
  }
  
  return {
    add,
    list
  };
  
};
module.exports = Instance;
