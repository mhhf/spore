"use strict";

var fs = require('fs-extra');
var readlineSync = require('readline-sync');
var tv4 = require('tv4');

// var working_dir = process.env.SPORE_WORKING_DIR;

// @param cli interactive cli = true - ask about defaults, false = don't ask
var init = function( config ) {
    
  let dirs = config.working_dir.split('/'); 
  let tmpProjectName = dirs[ dirs.length - 1 ];
  
  var name = tmpProjectName;
  var version = '0.1.0';
  var desc = '';
  
  if( config.cli ) {
    name = readlineSync.question(`Name of your project [${tmpProjectName}]:`);
    version = readlineSync.question(`Version [0.1.0]:`);
    desc = readlineSync.question(`Package description :`);
  }
  
  var json = {
    name: name,
    version: version,
    description: desc,
    dependencies: {
    },
    contracts: [],
    ignore: [],
    files: []
  };
  
  fs.writeFileSync( config.working_dir + '/spore.json', JSON.stringify( json, false, 2 ));
  if( config.cli )
    console.log('\ninit spore');
}

module.exports = init;
