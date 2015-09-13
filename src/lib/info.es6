"use strict";

var deasync         = require('deasync');

var getLinkSync     = deasync( spore.getLink );
var ipfsCatJsonSync = deasync( ipfs.catJson );

var info = function( package_name ) {
  
  var ipfsAddress = getLinkSync( package_name );
  var json = ipfsCatJsonSync( ipfsAddress );
  
  console.log( JSON.stringify(json, false, 2) );
  
  
}

module.exports = info;
