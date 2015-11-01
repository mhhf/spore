"use strict"; 

var docopt = require('docopt');
var fs     = require('fs-extra');
var _      = require('underscore');
var CONFIG = require( '../config.es6' );
var readlineSync = require('readline-sync');
var vm     = require('../emulation.es6');
require('shelljs/global');

var binDir = process.env.SPORE_NPM_LOCATION+'/bin';

module.exports = function( config ) {
  
  config.removeBundle( config['<name>'] )
  
  rm( binDir + '/' + config['<name>'] );

};
