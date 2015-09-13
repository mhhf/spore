var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');

var ipfs            = require('./ipfs.es6');
var pkg             = require('./package.es6');

var getLinkSync     = deasync( spore.getLink );

var working_dir = process.argv[2];

var rm = function( name ) {
  
  // check if package is installed
  pkg.assertDependency(name);
  
  pkg.removeDep( name );
  
  pkg.saveJson();
  
  console.log(`Package "${name}" successful removed."`.green);

}
module.exports = rm;
