"use strict"; 

var docopt = require('docopt');
var fs = require('fs-extra');
var _ = require('underscore');

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


var home = process.env.HOME || process.env.USERPROFILE;
if( !fs.existsSync( home + '/.spore.json' ) ) {
  require('./src/lib/setup.es6')();
}

var app = docopt.docopt(doc, {
  argv: process.argv.slice(2),
  help: true,
  version: '0.0.1' 
});

var config = require( home + '/.sporerc.json' );
_.extend( config, app, { cli: true, working_dir } );

if( app.init ) { //===================================================== INIT
  
  // true fir cli
  require('./src/lib/init.es6')( config );
  console.log('\ninit spore');
    
} else if( app.info ) { //============================================== INFO
  
  let package_name = app['<package>'];
  
  require('./src/lib/info.es6')( _.extend(config, {package_name}) );
  
} else if( app.publish ) { //=========================================== PUBLISH
  
  var hash = require('./src/lib/publish.es6')( config );
  
  console.log( 'Package published: ' + hash );
 
} else if( app.install ) { //=========================================== INSTALL
  
  let package_name = app['<package>'];
  
  require( './src/lib/install.es6' )( _.extend( config, {package_name}) );

} else if( app.add ) { //=============================================== ADD
  
  let path_to_file = app['<path>'];
  
  require('./src/lib/add.es6')( _.extend( config, {path_to_file} ) );

} else if( app.uninstall ) { //========================================= UNINSTALL
  
  var package_name = app['<package>'];
  
  require('./src/lib/uninstall.es6')( _.extend( config, { package_name } ) );

} else if( app.update ) { //============================================ UPDATE
  
  require('./src/lib/update.es6')( config );

} else if( app.status ) { //============================================ STATUS

  // TODO - implement
  require('./src/lib/status.es6')( config );
  
}


process.exit();
