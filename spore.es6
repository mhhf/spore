var fs = require('fs-extra');
var readlineSync = require('readline-sync');
var tv4 = require('tv4');
var Pudding = require('ether-pudding')

var docopt = require('docopt');

// https://github.com/ConsenSys/ipfs.js
var ipfs = require('ipfs-js');

// Setup IPFS
ipfs.setProvider(require('ipfs-api')('localhost', '5001'));

var web3 = require('web3');

// Setup Web3
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
// 
// Setup default Account
web3.eth.defaultAccount = web3.eth.coinbase;

var spore = require('./src/contracts.json').contracts.Spore;

// Setup Contract
// Simple as Fuck Package mainanance
var address = '0xa087766375d8b90509cf4f08081d3ddaf8ac6ca7';
var abi = JSON.parse(spore['json-abi']);
var contract = web3.eth.contract(abi).at(address);

var doc = `
Simple package management for Ethereum

Usage:
  spore init
  spore install 
  spore publish 
  spore info   <package>
  spore search <package>
  spore add    <package> 
  spore rm     <package>
  
Arguments:
  <package>                    Package name 
  
Options:
  --version                    Shows the Version of spore
`;
// --dep [<package>]            Package has to depend on <package>


// General Spore settings
var settings = {
};

// Current directory
var dir = process.argv[2];

var application = docopt.docopt(doc, {argv: process.argv.slice(3), help: true, version: '0.0.1' });

if( application.init ) { //======================================================  INIT
    
    // Check if .spore exists in current directory
    var sporeDir = fs.existsSync( dir + '/.spore/' );
    
    if( !sporeDir ) {
      fs.mkdirSync( dir + '/.spore/');
      fs.mkdirSync( dir + '/.spore/packages/');
      
      let path = dir.split('/'); 
      let tmpProjectName = path[ path.length - 1 ];
      
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
        files: []
      };
      
      fs.writeFileSync( dir + '/spore.json', JSON.stringify( json, false, 2 ));
    }
    console.log('\ninit spore');
    
    process.exit();
    
} else if( application.info ) { //================================================ INFO
  
  contract.getLink( application['<package>'], function( err, ipfsAddress ) {
    
    ipfs.api.ls( ipfsAddress, function(err, obj ) {
      if (err) throw err;
      obj.Objects[0].Links.forEach( ( o ) => {
        if( o.Name === 'spore.json' ) {
          ipfs.cat( o.Hash, ( err, content ) => {
            console.log( content );
            process.exit();
          });
        }
      });
    });
    
  });
} else if( application.publish ) { //========================================== PUBLISH
  
  // Check if spore.json has the right format
  let json = JSON.parse(fs.readFileSync( dir + '/spore.json', 'utf8' ));
  let isValide = tv4.validate( require('./src/spec.json'), json );
  if( !isValide ) throw tv4.error;
  
  // Check if any files are about to be included
  if( !Array.isArray(json.files) || json.files.length == 0 ) 
    throw new Error('Include some files first');
  
  // Check if files which are linked from spore.json exists
  json.files.forEach( ( path ) => {
    let exists = fs.existsSync( dir + '/' + path );
    if( !exists ) throw new Error(`File ${path} can't be found in ${dir}`);
  });

  // Check if name isn't taken, yet or the owner owns the package name
  contract.getOwner( json.name, function( err, addr ) {
    if( err ) throw err;
    if( addr != '0x0000000000000000000000000000000000000000' 
       && addr != web3.eth.defaultAccount ) 
     throw new Error(`Package with name ${json.name} is already owned by ${addr}`);
     
      
    // TODO - Check if cliet has funds to publish the package
    // web3.eth.estimateGas({
    //   to: address, 
    //   data: 
    // });
    // Create an ipfs dag node on folder
    
    fs.mkdirSync( dir + '/.spore/build');
    json.files.forEach( ( path ) => {
      fs.copySync( dir + '/' + path, dir + '/.spore/build/' + path );
    });
    fs.copySync( dir + '/spore.json', dir + '/.spore/build/spore.json' );
    
    // Inform the user about the gas price
    
    // publish name and ipfs link to contract
    ipfs.api.add( dir + "/.spore/build/", {"r": true}, function( err, ret ) {
      
      var hash = ret.find( (o) => { return o.Name === 'build';  }).Hash;
      
      contract.registerPackage( json.name, hash, ( err, transaction ) => {
        fs.removeSync( dir + '/.spore/build' );
        console.log('package published');
        process.exit();
      });
      
    })
    
  });
 
} else if( application.add ) { //================================================== ADD
  let name = application['<package>'];

  var cloneDir = ( addr, dir, cb ) => {
    ipfs.api.ls( addr, ( err, node ) => {
      
      node.Objects[0].Links.forEach( ( l ) => {
        
        if( l.Type === 1 ) { // dir
          fs.mkdirSync(  dir + '/' + l.Name )
          cloneDir( l.Hash, dir + '/' + l.Name, cb );
        } else if( l.Type === 2 ) { // file
          ipfs.cat( l.Hash, ( err, data ) => {
            fs.writeFileSync( dir + '/' + l.Name, data );
          });
        }
        
      });
    });
  }
  
  contract.getLink( name, function( err, ipfsAddress ) {
    // TODO - check if not error and not null
    fs.mkdirSync( dir + '/.spore/packages/'+name );
    cloneDir( ipfsAddress, dir + '/.spore/packages/'+name, () => {
      process.exit();
    });
    
  });
} 
