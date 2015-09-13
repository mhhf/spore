var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');

var ipfs            = require('./ipfs.es6');

var getLinkSync     = deasync( spore.getLink );

var rm = function( config ) {
  
  var pkg = require('./package.es6')( config.working_dir );
  
  // check if package is installed
  pkg.assertDependency( config.package_name );
  
  pkg.removeDep( config.package_name );
  
  pkg.saveJson();
  
  console.log(`Package "${package_name}" successful removed."`.green);

}
module.exports = rm;
