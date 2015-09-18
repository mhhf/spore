"use strict"; 

var docopt = require('docopt');
var fs     = require('fs-extra');
var _      = require('underscore');
var PKG    = require('./src/lib/package.es6');
var CONFIG = require( './src/lib/config.es6' );

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
var env = require( home + '/.spore.json' );

var app = docopt.docopt(doc, {
  argv: process.argv.slice(2),
  help: true,
  version: '0.0.2' 
});

// TODO - refactor this mess
var cfg    = CONFIG( env );
var pkg    = PKG( _.extend(cfg, {working_dir}) );
var config = _.extend( {}, cfg, app, { cli: true, pkg } );

// var config = require( home + '/.sporerc.json' );

if( app.init ) { //===================================================== INIT
  
  // true fir cli
  require('./src/lib/init.es6')( config );
  console.log('\ninit spore');
    
} else if( app.info ) { //============================================== INFO
  
  let package_name = app['<package>'];
  
  var json = require('./src/lib/info.es6')( _.extend(config, {package_name}) );

  console.log( JSON.stringify(json, false, 2) );
  
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
