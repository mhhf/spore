"use strict";

var deasync         = require('deasync');
var spore           = require('./spore.es6');
var ipfs            = require('./ipfs.es6');

var info = function( package_name ) {
  
  var ipfsAddress = spore.getLinkSync( package_name );
  var json = ipfs.catJsonSync( ipfsAddress );
  
  console.log( JSON.stringify(json, false, 2) );
  
  
}

module.exports = info;
