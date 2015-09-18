var _               = require('underscore');
var SPORE           = require('./spore.es6');
var IPFS            = require('./ipfs.es6');

// Expects 
// {
//   eth_host,
//   eth_port,
//   spore_address,
//   ipfs_host,
//   ipfs_port
// } 
module.exports = function ( config ){
  
  var ipfs = IPFS( config.ipfs_host, config.ipfs_port );
  var spore = SPORE( config.eth_host, config.eth_port, config.spore_address );
  
  var cfg = _.omit( config, [ 
    'ipfs_host',
    'ipfs_port',
    'eth_host',
    'eth_port',
    'spore_address'
  ]);

  // var pkg = require('./package.es6')( _.extend( cfg, ipfs, spore ) );
  
  // return _.extend( cfg, pkg ); 
  // 
  
  var c = _.extend( cfg, { ipfs, spore } );
  return  c;
}
