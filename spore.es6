"use strict"; 

var docopt = require('docopt');
var fs     = require('fs-extra');
var _      = require('underscore');
var CONFIG = require( './src/lib/config.es6' );


var __package = require('./package.json');


var cli = fs.readFileSync(__dirname + `/src/specs/cli_${__package.spore.cli_version}.docopt`,'utf8');

var app = docopt.docopt(cli, {
  argv: process.argv.slice(2),
  help: false,
  version: __package.version
});

var config = CONFIG( app, { 
  cli: true
});


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
  
  require( './src/lib/install.es6' )( config );

} else if( !app.remote && !app.instance && app.add ) { //=================== ADD
  
  let path_to_file = app['<path>'];
  
  require('./src/lib/add.es6')( _.extend( config, {path_to_file} ) );

} else if( app.uninstall ) { //======================================= UNINSTALL
  
  require('./src/lib/uninstall.es6')( config );

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

  var cloned = require('./src/lib/clone.es6')( config );
  if( cloned ) console.log(`${config['<package>']} cloned!`);

} else if( app.instance && app.add ) { //========================== INSTANCE ADD
  
  require('./src/lib/instanceadd.es6')( config );
  
} else if( app.instance && app.list ) { //======================== INSTANCE LIST
  
  require('./src/lib/instancelist.es6')( config );
  
} else if( app.link ) { //================================================= LINK
  
  require('./src/lib/link.es6')( config );

} else if( app.bin ) {
  
  if( app.bundle ) {
    require('./src/lib/bin/bundle.es6')( config );
  } else if ( app.list ) {
    require('./src/lib/bin/list.es6')( config );
  } else if( app.call ) {
    require('./src/lib/bin/call.es6')( config );
  } else if( app.remove ) {
    require('./src/lib/bin/remove.es6')( config );
  }
  

} 
  
// process.exit();
