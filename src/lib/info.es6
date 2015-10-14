"use strict";

var deasync         = require('deasync');
require('colors');

var info = function( config ) {
  var pkg = config['<package>'];
  if( pkg ) {
    if( pkg.length <= 32 ) // Is pkg a name or an IPFS hash?
      pkg = config.contracts.spore().getLinkSync( pkg ); // asume name
    config.log('link: '+pkg);
    if( !pkg ) {
      console.log('ERROR'.red+`: no package "${config['<package>']}" found.` );
      return null;
    }
    return config.ipfs().catJsonSync( pkg );
  } else {
    return config.pkg().json; 
  }
  
}

module.exports = info;
