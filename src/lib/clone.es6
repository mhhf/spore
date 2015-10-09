"use strict";

var tv4             = require('tv4');
var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');

var clone = function( config ){
  
  var name = config['<package>'];
  
  fs.ensureDirSync(config.working_dir+'/'+name);
  
  var addr = config.contracts.spore().getLinkSync( name );
  
  var header = config.ipfs().catJsonSync( addr );
  
  var files = config.ipfs().mapAddressToFileSync( header.root );
  
  config.ipfs().checkoutFilesSync( config.working_dir+'/'+name, files );
  
  header.files = files;
  header.ignore = [];
  
  delete header.pv;
  delete header.solc;
  delete header.root;
  
  header.contracts = Object.keys( header.contracts );
  header.files = Object.keys( header.files );
  
  fs.writeFileSync( config.working_dir + '/' + name + '/spore.json', JSON.stringify(header,false,2) );
  
  return true;
};

module.exports = clone;
