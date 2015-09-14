"use strict"; 

// var Pudding = require('ether-pudding')

var docopt = require('docopt');

// https://github.com/ConsenSys/ipfs.js
root.ipfs = require('ipfs-js');

// Setup IPFS
ipfs.setProvider(require('ipfs-api')('localhost', '5001'));

// var web3 = require('web3');

// Setup Web3
// web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
// 
// Setup default Account
// web3.eth.defaultAccount = web3.eth.coinbase;

// var spore = require('./src/contracts.json').contracts.Spore;

// Setup Contract
// Simple as Fuck Package mainanance
// var address = '0xf8547bb87e48018eac009b14327a60341b3a913d';
// var abi = JSON.parse(spore['json-abi']);
// root.contract = Pudding.whisk( abi ).at( address );
// root.spore = web3.eth.contract(abi).at(address);

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
  --version                    Shows the Version of spore
`;
// --dep [<package>]            Package has to depend on <package>

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

} else if( application.uninstall ) { //========================================= REMOVE
  
  var package_name = application['<package>'];
  
  require('./src/lib/uninstall.es6')( {
    working_dir,  
    package_name 
  });

} else if( application.update ) {
  
  require('./src/lib/update.es6')({
    working_dir
  });

} else if( application.status ) {

  require('./src/lib/status.es6')( );
  
}


process.exit();
