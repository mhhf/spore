var fs = require('fs-extra');
var readlineSync = require('readline-sync');
var tv4 = require('tv4');

var working_dir = process.argv[2];

var init = function() {
    
  // Check if .spore exists in current directory
  var sporeDir = fs.existsSync( working_dir + '/.spore/' );

  if( !sporeDir ) {
    // fs.mkdirSync( working_dir + '/.spore/');
    // fs.mkdirSync( working_dir + '/.spore/packages/');
    
    let dirs = working_dir.split('/'); 
    let tmpProjectName = dirs[ dirs.length - 1 ];
    
    var name = readlineSync.question(`Name of your project [${tmpProjectName}]:`);
    if( name === '' ) name = tmpProjectName;
    
    var version = readlineSync.question(`Version [0.1.0]:`);
    if( version === '' ) version = '0.1.0';
    
    var desc = readlineSync.question(`Package description :`);
    
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
    
    fs.writeFileSync( working_dir + '/spore.json', JSON.stringify( json, false, 2 ));
  }
  console.log('\ninit spore');
  
}

module.exports = init;
