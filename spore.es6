var fs = require('fs-extra');
var readlineSync = require('readline-sync');
var tv4 = require('tv4');
var Pudding = require('ether-pudding')
var child_process = require('child_process');
var async = require('async');


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
var contract = Pudding.whisk( abi ).at( address );
// var contract = web3.eth.contract(abi).at(address);

var doc = `
Simple package management for Ethereum

Usage:
  spore init
  spore publish 
  spore info   <package>
  spore search <package>
  spore install <package>
  spore add    <path> 
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
// TODO - Substitude this with process.env...
var path = process.argv[2];



var application = docopt.docopt(doc, {argv: process.argv.slice(3), help: true, version: '0.0.1' });

if( application.init ) { //===================================================== INIT
    
    // Check if .spore exists in current directory
    var sporeDir = fs.existsSync( path + '/.spore/' );
    
    if( !sporeDir ) {
      fs.mkdirSync( path + '/.spore/');
      fs.mkdirSync( path + '/.spore/packages/');
      
      let dirs = path.split('/'); 
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
        files: []
      };
      
      fs.writeFileSync( path + '/spore.json', JSON.stringify( json, false, 2 ));
    }
    console.log('\ninit spore');
    
    process.exit();
    
} else if( application.info ) { //============================================== INFO
  
  var package_name = application['<package>'];
  
  contract.getLink.call( package_name )
  .then( ( ipfsAddress ) => {
    
    // TODO - array.find 
    ipfs.api.ls( ipfsAddress, function( err, obj ) {
      if (err) throw err;
      
      var json = obj.Objects[0].Links.find( ( o ) => {
        return o.Name === 'spore.json';
      });
      
      ipfs.cat( json.Hash, ( err, content ) => {
        console.log( content );
        process.exit();
      });
      
    });
    
  });
} else if( application.publish ) { //=========================================== PUBLISH
  
  // Check if spore.json has the right format
  let json = JSON.parse(fs.readFileSync( path + '/spore.json', 'utf8' ));
  let isValide = tv4.validate( require('./src/spec.json'), json );
  if( !isValide ) throw tv4.error;
  
  let files = json.files.concat( json.contracts.map((c => { return c.file;})) );
  
  // Check if any files are about to be included
  if( files.length == 0 ) 
    throw new Error('Include some files first');
  
  
  // Check if files which are linked from spore.json exists
  files.forEach( ( file ) => {
    let exists = fs.existsSync( path + '/' + file );
    if( !exists ) throw new Error(`File ${file} can't be found in ${path}`);
  });
  
  // console.log( json.name );

  // Check if name isn't taken, yet or the owner owns the package name
  contract.getOwner.call( json.name )
  .then( ( addr ) =>  {
    if( addr != '0x0000000000000000000000000000000000000000' 
       && addr != web3.eth.defaultAccount ) 
     throw new Error(`Package with name ${json.name} is already owned by ${addr}`);
     
      
    // TODO - Check if cliet has funds to publish the package
    // web3.eth.estimateGas({
    //   to: address, 
    //   data: 
    // });
    // Create an ipfs dag node on folder
    
    fs.mkdirSync( path + '/.spore/build');
    files.forEach( ( file ) => {
      fs.copySync( path + '/' + file, path + '/.spore/build/' + file );
    });
    fs.copySync( path + '/spore.json', path + '/.spore/build/spore.json' );
    
    // Inform the user about the gas price
    console.log('GAS will be spend');
    
    // publish name and ipfs link to contract
    ipfs.api.add( path + "/.spore/build/", {"r": true}, function( err, ret ) {
      
      var hash = ret.find( (o) => { return o.Name === 'build';  }).Hash;
      console.log(hash);
      contract.registerPackage( json.name, hash)
      .then( ( transaction ) => {
        fs.removeSync( path + '/.spore/build' );
        console.log('package published');
        process.exit();
      });
      
    });
    
  });
 
} else if( application.install ) { //============================================ INSTALL
  let name = application['<package>'];

  var cloneDir = ( addr, path, cb ) => {
    ipfs.api.ls( addr, ( err, node ) => {
      
      var rdyCounter = node.Objects[0].Links.length;
      node.Objects[0].Links.forEach( ( l ) => {
        
        if( l.Type === 1 ) { // path
          // If dir don't exists: update
          if( !fs.existsSync( path + '/' + l.Name ) )
            fs.mkdirSync(  path + '/' + l.Name )
          
          cloneDir( l.Hash, path + '/' + l.Name, () => {
            if( --rdyCounter === 0 ) cb();
          });
        } else if( l.Type === 2 ) { // file
          ipfs.cat( l.Hash, ( err, data ) => {
            if( l.Name != "spore.json" ) {
              fs.writeFileSync( path + '/' + l.Name, data );
            }
            if( --rdyCounter === 0 ) cb();
          });
        }
        
      });
    });
  };
  
  contract.getLink.call( name )
  .then( ( ipfsAddress ) => {
    console.log('fetching '+ ipfsAddress );
    // TODO - check if contract returns not error and not null
    
    // add new package to dependencies

    cloneDir( ipfsAddress, path + '/', () => {
      process.exit();
    });
  });
} else if( application.add ) { //=============================================== ADD
  
  let path_to_file = application['<path>'];
  
  if( !fs.existsSync( path + '/' + path_to_file ) )
    throw new Error(`Can't find ${path_to_file} in ${path}` );
  
  let json = JSON.parse(fs.readFileSync( path + '/spore.json', 'utf8' ));
  
  // TODO - check if file is already added
  
  // If the added file is a contract, 
  // then compile it and add it with it's abi and natspec
  if( (/.*contracts.*/g).test(path_to_file) ) {
    var cmd = "solc --input-file "+ path_to_file + " --combined-json json-abi,natspec-dev";
    var out = JSON.parse( child_process.execSync(cmd, {encoding:'utf8'})).contracts;
    var contractName = Object.keys(out)[0]; // Only one contract per file is allowed
    
    var object = json.contracts.find( (c) => { return c.file === path_to_file; });
    
    if( object ) {
      console.log('Updating ' + path_to_file );
      
      object.abi = JSON.parse( out[ contractName ]['json-abi'] );
      object.natspec = JSON.parse( out[ contractName ]["natspec-dev"] );
      
    } else {
      json.contracts.push({
        "file": path_to_file,
        "abi": JSON.parse( out[ contractName ]['json-abi'] ),
        "natspec": JSON.parse( out[ contractName ]["natspec-dev"] )
      });
    }
    
  } else {
    if( json.files.indexOf( path_to_file ) > -1 ) {
      console.log('File is already added');
    } else {
      json.files.push( path_to_file );
    }
  }
 
  fs.writeFileSync( path + '/spore.json', JSON.stringify( json, false, 2 ) );
  process.exit();

}
