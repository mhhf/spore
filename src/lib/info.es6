"use strict";

var deasync         = require('deasync');
var SPORE           = require('./spore.es6');
var IPFS            = require('./ipfs.es6');

var info = function( config ) {
  
  var ipfs = IPFS( config.ipfs_host, config.ipfs_port );
  var spore = SPORE( config.eth_host, config.eth_port, config.spore_address );
  
  var ipfsAddress = spore.getLinkSync( config['<package>'] );
  var json = ipfs.catJsonSync( ipfsAddress );
  
  console.log( JSON.stringify(json, false, 2) );
  
  
}

module.exports = info;
