"use strict";

var fs           = require('fs-extra');
var tv4          = require('tv4');
var file         = require('file');
var path         = require('path');
var colors       = require('colors');
var _            = require('underscore');
var readlineSync = require('readline-sync');

// DIR_PATH -> [FILES]
// returns a set of relative pathes
var getFileSet = function( dist ){

  var fileset = [];
  file.walkSync( dist, ( dirPath, dirs, files ) => {
    
    // let relative_path = path.relative( config.working_dir, dirPath);
    // if ( relative_path != "" ) relative_path += '/';
    
    let fset = files.map( f =>  dirPath + '/' + f );
    
    fileset = fileset.concat( fset );
    
  });
  
  return fileset;
}

// PATH -> [FILES]
var getFiles = function( dist ) {
   
  // Edge Cases
  if( !fs.existsSync( dist ) )
    return [];
  
  if( fs.lstatSync( dist ).isDirectory() ) {
    return getFileSet( dist );
  } else {
    return [ dist ];
  }
}

// [FILES] -> [FILES]
// Filter relevant files
var filterFiles = function( files, config ) {
  return files
    .map( f => {
      return path.relative( config.working_dir, f );
    })
    .filter( (f) => { 
      
      let valide = 
        f != "" 
        && f != '/spore.json' // ignore spore.json
        && !(/spore_packages/).test(f) // ignore spore_packages dirs
        && config.pkg().json.files.indexOf( f ) == -1 // File already included
        && config.pkg().json.ignore.indexOf( f ) == -1 // ignore files in json.ignore
        
      return valide
     
    });
}

// Handle Contract files
//
// 1. Filter .sol files
// 2. Grab all contracts
// 3. If not cli or user wats them to get added => add them seperatly
// 
var handleContracts = function( files, config ) {
  
  var sols = files.filter( f => /.*\.sol$/.test(f) );

  var contracts = _.flatten(
    sols.map( f => {
    let content = fs.readFileSync( config.working_dir + '/' + f, 'utf8' );
    config.log('content: '+content);
    return content
      .match( /contract\s+(\w)+[^{]*{/g )
      .map( r => r.split(/\s+/)[1].split('{')[0] );
  }));
  
  // Ask the user which contract he want to be included
  // 
  var toInclude = contracts;
  if( config.cli && contracts.length > 0 ) {
    console.log(`Following contracts found: ${contracts}`);
    
    toInclude = contracts.filter( contract => {
      return (/^\s*y/g)
        .test( readlineSync 
        .question(`Include contract: ${contract} (y/n): `) );
    });
  }
  
  // Include contracts to json
  config.pkg().json.contracts = _.uniq( config.pkg().json.contracts.concat( toInclude ) )
  
}


var add = function( config ) {
  
  var dist = config.working_dir + '/' + config.path_to_file;
  var files = getFiles( dist );
  
  // Filter relevant files
  files = filterFiles( files, config );
    
  // Handle contract Files
  handleContracts( files, config );  
    
  // Add files
  config.pkg().json.files = _.uniq( config.pkg().json.files.concat(files) );
  
  // Save json
  config.pkg().saveJson();
    
  // Feedback
  if( config.cli ) {
    if( files.length > 0  ) {
      console.log( "Added Files:\n" + files.join('\n') );
    } else {
      console.log( "Nothing new to add." );
    }
  }
  
}

module.exports = add;
