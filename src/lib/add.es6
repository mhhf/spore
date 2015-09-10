var fs          = require('fs-extra');
var tv4         = require('tv4');
var file        = require('file');
var path        = require('path');
var colors      = require('colors');

var working_dir = process.argv[2];

// PATH -> [PATH]
// returns a set of relative pathes
var getFileSet = function( absolutePath ){

  var fileset = [];
  file.walkSync( absolutePath, ( dirPath, dirs, files ) => {
    
    let fset = files.map( f => file.path.relativePath( working_dir, dirPath) + '/' + f );
    
    fileset = fileset.concat(fset);
    
  });
  
  return fileset;
}


var add = function( pathString ) {
  
  // Edge Cases
  if( !fs.existsSync( pathString ) )
    throw new Error(`Can't find ${pathString} in ${pathString}` );
    
  var jsonFile = fs.readFileSync( working_dir + '/spore.json', 'utf8' );
    
  if( !jsonFile ) throw new Error('Can\'t find spore.json');
    
  // Load json
  let json = JSON.parse(jsonFile);
    
  // test json
  if( !json || !tv4.validate(json,require('../user_spec.json')) )
    throw new Error('Malformed json file: '+tv4.error);
    
  var absolutePath = file.path.abspath( pathString );
    
  var files = getFileSet( absolutePath );
    
  
  files = files
    .filter( (f) => { 
      
      let valide = 
        f != "" 
        && f != '/spore.json' // ignore spore.json
        && json.files.indexOf( f ) == -1 // File already included
        && json.ignore.indexOf( f ) == -1 // ignore files in json.ignore
      
      return valide
         
    });
    
  // TODO - scan for contracts and ask if they should be added
    
  files.forEach( f => {
    json.files.push( f );
    console.log(`File added: ${f}`.green);
  })
  

    
  fs.writeFileSync( working_dir + '/spore.json', JSON.stringify( json, false, 2 ) );
}

module.exports = add;
