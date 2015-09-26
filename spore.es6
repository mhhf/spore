"use strict"; 

var docopt = require('docopt');
var fs     = require('fs-extra');
var _      = require('underscore');
var CONFIG = require( './src/lib/config.es6' );


var version = '0.0.3';



var doc = `
Simple package management for Ethereum

Usage:
  spore init
  spore publish 
  spore update
  spore info      <package>
  spore install   <package>
  spore uninstall <package>
  spore add       <path>
  
  spore remote list
  spore remote select <name>
  spore remote add    <name>
  spore remote remove <name>
  
Arguments:
  <package>                    Package name 
  <path>                       path to file/ directory
  <name>                       rpc settings name
  
Options:
  -v, --version                Shows the Version of spore
  -h, --help                   Shows this Help Screen
`;

// TODO - search 
// spore search    <package>

// TODO - chain management
// spore list chains
// spore set chain

// --dep [<package>]            Package has to depend on <package>


var app = docopt.docopt(doc, {
  argv: process.argv.slice(2),
  help: true,
  version: version
});

var config = CONFIG( app, { cli: true } );

// var config = require( home + '/.sporerc.json' );

if( app.init ) { //======================================================== INIT
  
  // true fir cli
  require('./src/lib/init.es6')( config );
  console.log('\ninit spore');
    
} else if( app.remote ) { //============================================= REMOTE
  
  require('./src/lib/chain.es6')( config );

} else {
  config.initSpore();
  config.initIPFS();
  config.initPkg();
}

if( app.info ) { //======================================================== INFO
  
  let package_name = app['<package>'];
  
  var json = require('./src/lib/info.es6')( _.extend(config, { package_name }) );

  console.log( JSON.stringify(json, false, 2) );
  
} else if( app.publish ) { //=========================================== PUBLISH
  
  var hash = require('./src/lib/publish.es6')( config );
  
  console.log( 'Package published: ' + hash );
 
} else if( app.install ) { //=========================================== INSTALL
  
  let package_name = app['<package>'];
  
  require( './src/lib/install.es6' )( _.extend( config, {package_name}) );

} else if( !app.remote && app.add ) { //==================================== ADD
  
  let path_to_file = app['<path>'];
  
  require('./src/lib/add.es6')( _.extend( config, {path_to_file} ) );

} else if( app.uninstall ) { //======================================= UNINSTALL
  
  var package_name = app['<package>'];
  
  require('./src/lib/uninstall.es6')( _.extend( config, { package_name } ) );

} else if( app.update ) { //============================================= UPDATE
  
  require('./src/lib/update.es6')( config );

} else if( app.status ) { //============================================= STATUS

  // TODO - implement
  require('./src/lib/status.es6')( config );
  
}


process.exit();
