"use strict";

var tv4             = require('tv4');
var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');

var install = function( config ){
  
  var pkgs;
  if( config['<package>'] ) {
    config.pkg().installDep( 'spore_packages', config['<package>'] );
    config.pkg().saveJson();
    if( config.cli ) console.log( `Package ${config.package_name} installed.` );
  } else {
    require('./upgrade.es6')( config );
  }
  

};

module.exports = install;
