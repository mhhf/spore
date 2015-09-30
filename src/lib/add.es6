"use strict";

var fs           = require('fs-extra');
var tv4          = require('tv4');
var file         = require('file');
var path         = require('path');
var colors       = require('colors');
var _            = require('underscore');
var readlineSync = require('readline-sync');

// PATH -> [PATH]
// returns a set of relative pathes
var getFileSet = function( config ){

  var fileset = [];
  file.walkSync( config.path_to_file, ( dirPath, dirs, files ) => {
    
    let relative_path = path.relative( config.working_dir, dirPath);
    if ( relative_path != "" ) relative_path += '/';
    
    let fset = files.map( f =>  relative_path + f );
    
    fileset = fileset.concat(fset);
    
  });
  
  return fileset;
}


// TODO pkg -> config.pkg
var add = function( config ) {
  
  // Edge Cases
  if( !fs.existsSync( config.working_dir + '/' + config.path_to_file ) )
    throw new Error(`Can't find ${config.path_to_file}` );
    
  if( fs.lstatSync( config.working_dir + '/' + config.path_to_file ).isDirectory() ) {
    var files = getFileSet( config );
  } else {
    var files = [config.path_to_file];
  }
  
  files = files
    .filter( (f) => { 
      
      let valide = 
        f != "" 
        && f != '/spore.json' // ignore spore.json
        && config.pkg.json.files.indexOf( f ) == -1 // File already included
        && config.pkg.json.ignore.indexOf( f ) == -1 // ignore files in json.ignore
      
      return valide
         
    });
    
  var sols = files.filter( f => /.*\.sol$/.test(f) );
  

  var contracts = _.flatten(
    sols.map( f => {
    let content = fs.readFileSync( config.working_dir + '/' + f, 'utf8' );
    return content
      .match( /contract\s+(\w)+\s+{/g )
      .map( r => r.split(/\s+/)[1].split('{')[0] );
  }))
   
  var includeContracts = contracts.length > 0;
  
  // scan for contracts and ask if they should be added
  // Ask if to include contracts for publishing
  if( config.cli && contracts.length > 0 ) {
    var readlineSync = require('readline-sync');
    let answer = readlineSync.question(`Include contracts: ${contracts} [y/n]: `);
    includeContracts = (/^\s*y/g).test( answer );
  }
  
  if( includeContracts ) {
    config.pkg.json.contracts = _.uniq( config.pkg.json.contracts.concat( contracts ) )
  }
    
  config.pkg.json.files = _.uniq( config.pkg.json.files.concat(files) );
  
  if( config.cli && files.length > 0 ) {
    console.log( "Added Files:\n" + files.join('\n') );
  } else {
    console.log( "Nothing new to add." );
  }
  
  config.pkg.saveJson();
  
  
}

module.exports = add;
