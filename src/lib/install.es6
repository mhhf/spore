"use strict";

var tv4             = require('tv4');
var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');


var pkg = require('./package.es6');
var ipfs = require('./ipfs.es6');

var install = function( name ){
  
  pkg.installDep( name );
  
  pkg.saveJson();

};

module.exports = install;
