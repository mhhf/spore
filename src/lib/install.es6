"use strict";

var tv4             = require('tv4');
var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');

var install = function( config ){
  
  config.pkg().installDep( 'spore_packages', config.package_name );
  
  config.pkg().saveJson();
  
  if( config.cli ) console.log( `Package ${config.package_name} installed.` );

};

module.exports = install;
