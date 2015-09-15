"use strict"; 

var docopt = require('docopt');

var doc = `
Simple package management for Ethereum

Usage:
  spore init
  spore publish 
  spore update
  spore info      <package>
  spore search    <package>
  spore install   <package>
  spore uninstall <package>
  spore add       <path>
  
Arguments:
  <package>                    Package name 
  <path>                       path to file/ directory
  
Options:
  -v, --version                Shows the Version of spore
  -h, --help                   Shows this Help Screen
`;
// --dep [<package>]            Package has to depend on <package>
// 
// TODO - Substitude this with process.env...
var working_dir = process.env.SPORE_WORKING_DIR;

var application = docopt.docopt(doc, {
  argv: process.argv.slice(2),
  help: true,
  version: '0.0.1' 
});

if( application.init ) { //===================================================== INIT
  
  // true fir cli
  require('./src/lib/init.es6')( {
    cli: true,
    working_dir
  });
    
} else if( application.info ) { //============================================== INFO
  
  var package_name = application['<package>'];
  
  require('./src/lib/info.es6')( package_name );
  
} else if( application.publish ) { //=========================================== PUBLISH
  
  var hash = require('./src/lib/publish.es6')({
    cli: true,
    working_dir
  });
  
  console.log( 'Package published: ' + hash );
 
} else if( application.install ) { //=========================================== INSTALL
  
  let package_name = application['<package>'];
  
  require( './src/lib/install.es6' )( {
    package_name,
    working_dir
  } );

} else if( application.add ) { //=============================================== ADD
  
  let path_to_file = application['<path>'];
  
  require('./src/lib/add.es6')( {
    working_dir,
    path_to_file
  });

} else if( application.uninstall ) { //========================================= UNINSTALL
  
  var package_name = application['<package>'];
  
  require('./src/lib/uninstall.es6')( {
    working_dir,  
    package_name 
  });

} else if( application.update ) { //============================================ UPDATE
  
  require('./src/lib/update.es6')({
    working_dir
  });

} else if( application.status ) { //============================================ STATUS

  // TODO - implement
  require('./src/lib/status.es6')( );
  
}


process.exit();
