"use strict";

var path = require('path');
var fs   = require('fs');
var _    = require('underscore');
var file = require('file');
var readlineSync = require('readline-sync');

module.exports = function( config ) {
  

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
  
  
  config.pkg().json.files
  .filter( f => (/\.sol$/).test( f ) ) // Filter solidity files
  .forEach( file => {
    // get relative path
    var rel = path.relative( config.working_dir, path.dirname(file) );
    var revrel = path.relative( path.dirname(file), config.working_dir );
    // grab all imports
    var content = fs.readFileSync( file, 'utf8' );
    var content_ = content.replace( /import ('|")[^'"]+('|");/g, (match) => {
      match = match.replace(/'/g, '"');
      var import_name = match.split('"')[1];
      
      config.log( `import found: ${import_name}` );
      
      // check imports
      var exists = fs.existsSync( `${rel}/${import_name}` ) || fs.existsSync( `${rel}/${import_name}.sol` );
      
      if( exists ) {
        config.log( `import exists!` );
        return `import "${import_name}";`;
      } else {
        config.log( `nothing to include in ${rel}/${import_name}, normalize and checking dependencies` );
        
        // Normalize
        var normalized = path.basename( import_name, '.sol' );
        config.log(`normalized: ${normalized}`)
        
        var found = [];
        _.map( config.pkg().json.dependencies, ( hash, name ) => `${name}-${hash.slice(2,10)}` )
          .forEach( dep => {
            config.log(`checking in spore_packages/${dep}`);
            var files = getFileSet( `spore_packages/${dep}` );
            found = found
              .concat( files.filter( f => (new RegExp(normalized+'.sol$')).test(f) ))
              .map( f => f.match(/^(.*).sol$/)[1] );
          });
          
        config.log('found', found);
        
        if( found.length == 1 ) {
          console.log(`Changed import in ${file} to ${revrel}/${found[0]}`);
          return `import "${revrel}/${found[0]}";`;
        } else if( found.length == 0) {
          console.log(`No files found for ${import_name}, try to link them manualy.`);
          return `import "${import_name}";`;
        } else {
          console.log(`Multiple files found for ${import_name}: \n${ found.map( (f,i) => i+": "+f+"\n" ) }`);
          var answer = readlineSync.question(`Choose a file to include (0-${found.length}): `);
          import_name = found[ parseInt( answer ) || 0 ];
          return `import "${revrel}/${import_name}";`;
        }
      }
      
    });
    
    fs.writeFileSync( file, content_ );
    
  });
  
}
