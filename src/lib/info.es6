"use strict";

var deasync         = require('deasync');

var info = function( config ) {
  
  var ipfsAddress = config.spore.getLinkSync( config.package_name );
  var json = config.ipfs.catJsonSync( ipfsAddress );
  
  return json;
  
}

module.exports = info;
