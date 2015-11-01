"use strict";

var tv4                 = require('tv4');
var fs                  = require('fs-extra');
var child_process       = require('child_process');
var _                   = require('underscore');
var path                = require('path');
var deasync             = require('deasync');
var Compiler            = require('./compiler.es6');



var publish = function( config ){
  

  // external JSON
  var validateJson = function( working_dir, json ) {
    
    var valide = tv4.validate( json, require('../specs/user_'+config.client_version+'.json') );
    if( !valide ) {
      console.log('ERROR'.red +': spore.json is not valide:\n' + tv4.error.message );
      process.exit();
    }
    
    let files = json.files;
    
    // Check if any files are about to be included
    if( files.length == 0 ) 
      throw new Error('Include some files first');
    
    // Check if linked files exists
    files.forEach( ( file ) => {
      let exists = fs.existsSync( working_dir + '/' + file );
      if( !exists ) throw new Error(`File ${file} can't be found in ${working_dir}`);
    });
  }







  // [PATH] -> IPFS_ROOT_HASH
  var publishFiles = function( working_dir, json ) {
    
    // Create an ipfs dag node on folder
    if( fs.existsSync( working_dir + '/.spore') ) 
      fs.rmdirSync( working_dir + '/.spore');
    fs.ensureDir( working_dir + '/.spore' );
    fs.ensureDir( working_dir + '/.spore/build');
    json.files.forEach( ( file ) => {
      fs.copySync( working_dir + '/' + file, working_dir + '/.spore/build/' + file );
    });
    
    try {
      var rootHash = config.ipfs().addSync( working_dir + "/.spore/build/", {"r": true} );
    } catch( e ) {
      fs.removeSync( working_dir + '/.spore' );
      console.log('ERROR'.red+': No connection to ipfs could be setablished. Is the ipfs daemon running?');
      process.exit();
    }
    
    fs.removeSync( working_dir + '/.spore' );
   
    // publish name and ipfs link to contract
    var packageDirHash = rootHash.find( (o) => { return o.Name === 'build'; }).Hash;
    
    return packageDirHash;
    
  }

  // var addJsonToIPFS = function( json ) {
  //     
  //   var jsonHash = config.ipfs().addJsonSync( json );
  //   
  //   return jsonHash;
  //   
  // }



  var assertOwnership = function( name ) {
    var addr = config.contracts.spore().getOwnerSync( name );
    if( addr != '0x0000000000000000000000000000000000000000' 
       && addr != config.web3().eth.defaultAccount ) 
     throw new Error(`Package with name ${json.name} is already owned by ${addr}`);
  }
  


  // ======================================== BEGIN
  




  
  // Check if spore.json has the right format
  // let json = JSON.parse(fs.readFileSync( working_dir + '/spore.json', 'utf8' ));
  validateJson( config.working_dir, config.pkg().json );
  
  
  // Check if name isn't taken, yet or the owner owns the package name
  assertOwnership( config.pkg().json.name );

  var ipfsNode = publishFiles( config.working_dir, config.pkg().json );
  
  var json = _.clone( config.pkg().json );
  
  json.root = ipfsNode;
  
  var solcVersion = child_process.execSync("solc --version", {encoding: 'utf8'})
  .match('Version: ([^/]+)/')[1];
  
  json.solc = solcVersion;
  
  // Compile Contracts
  var compiledContracts = Compiler( config ).compileContracts( config.working_dir, json.files );
  
  
  // pick the contracts specified in the json
  json.contracts = _.pick( compiledContracts, json.contracts );
  
  // transform json to internal
  delete json.files;
  delete json.ignore;
  
  json.pv = config.version;
  

  var valide = tv4.validate( json, require('../specs/ipfs_' + config.ipfs_version + '.json') );
  if( !valide ) {
    console.log('ERROR'.red + ': Could not create package. Please report this!:\n'+tv4.error.message);
    process.exit();
  }

  var jsonHash = config.ipfs().addJsonSync( json );
    
  // TODO - Check if cliet has funds to publish the package
  // web3.eth.estimateGas({
  //   to: address, 
  //   data: 
  // });
  // 
  // Inform the user about the gas price
  if( config.cli )
    console.log('brace yourself, gas will be spend!');
  
  // malform
  // console.log(jsonHash);
  // jsonHash = jsonHash.slice(0,2)+"Q"+jsonHash.slice(3);
  
  // console.log( json.name, jsonHash );
  
  var tx = config.contracts.spore().registerPackageSync( json.name, jsonHash, { gas: 300000 } );
  // config.log(tx);

  // var receipt = web3.eth.getTransactionReceipt( tx );
  // console.log( receipt );
  
  return jsonHash;
  
}

module.exports = publish;
