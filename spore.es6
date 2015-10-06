"use strict"; 

var docopt = require('docopt');
var fs     = require('fs-extra');
var _      = require('underscore');
var CONFIG = require( './src/lib/config.es6' );


var __package = require('./package.json');


var cli = fs.readFileSync('./src/specs/cli_0.0.4.docopt','utf8');

// spore status


var app = docopt.docopt(cli, {
  argv: process.argv.slice(2),
  help: true,
  version: __package.version
});

var config = CONFIG( app, { 
  cli: true,
  version:__package.version,
  ipfs_version: __package.spore.ipfs_version,
  client_version: __package.spore.client_version
});


// var config = require( home + '/.sporerc.json' );

if( app.init ) { //======================================================== INIT
  
  // true fir cli
  require('./src/lib/init.es6')( config );
  console.log('\ninit spore');
    
} else if( app.remote ) { //============================================= REMOTE
  
  require('./src/lib/chain.es6')( config );

} else if( app.info ) { //================================================= INFO
  
  var json = require('./src/lib/info.es6')( config );

  console.log( JSON.stringify(json, false, 2) );
  
} else if( app.publish ) { //=========================================== PUBLISH
  
  var hash = require('./src/lib/publish.es6')( config );
  
  console.log( 'Package published: ' + hash );
 
} else if( app.install ) { //=========================================== INSTALL
  
  let package_name = app['<package>'];
  
  require( './src/lib/install.es6' )( _.extend( config, {package_name}) );

} else if( !app.remote && !app.instance && app.add ) { //=================== ADD
  
  let path_to_file = app['<path>'];
  
  require('./src/lib/add.es6')( _.extend( config, {path_to_file} ) );

} else if( app.uninstall ) { //======================================= UNINSTALL
  
  var package_name = app['<package>'];
  
  require('./src/lib/uninstall.es6')( _.extend( config, { package_name } ) );

} else if( app.upgrade) { //============================================ UPGRADE
  
  require('./src/lib/upgrade.es6')( config );

} else if( app.status ) { //============================================= STATUS

  // TODO - implement
  require('./src/lib/status.es6')( config );
  
} else if( app.update ) { //============================================= UPDATE
  
  require('./src/lib/update.es6')( config );

} else if( app.search ) { //============================================= SEARCH
  
  require('./src/lib/search.es6')( config );

} else if( app.clone ) { // ============================================== CLONE

  require('./src/lib/clone.es6')( config );

} else if( app.instance && app.add ) { //========================== INSTANCE ADD
  
  require('./src/lib/instanceadd.es6')( config );
  
} else if( app.instance && app.list ) { //======================== INSTANCE LIST
  
  require('./src/lib/instancelist.es6')( config );
  
} else if( app.link ) { //================================================= LINK
  
  require('./src/lib/link.es6')( config );

}

process.exit();
