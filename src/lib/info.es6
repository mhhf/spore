"use strict";

var deasync         = require('deasync');

var info = function( config ) {
  
  var pkg = config['<package>'];
  if( pkg ) {
    if( pkg.length <= 32 ) // Is pkg a name or an IPFS hash?
      pkg = config.spore.getLinkSync( pkg ); // asume name
    return config.ipfs.catJsonSync( pkg );
  } else {
    return config.pkg.json; 
  }
  
  
}

module.exports = info;
