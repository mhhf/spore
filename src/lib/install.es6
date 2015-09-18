"use strict";

var tv4             = require('tv4');
var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');

var install = function( config ){
  
  config.pkg.installDep( config );
  
  config.pkg.saveJson();

};

module.exports = install;
