"use strict";

var tv4                 = require('tv4');
var fs                  = require('fs-extra');
var child_process       = require('child_process');
var _                   = require('underscore');
var path                = require('path');
var web3                = require('web3');
var deasync             = require('deasync');








var publish = function( config ){
  

  var compileContract = function( code ) {
    
    
    var cmd = "echo \"" + code.replace(/`/g,"\\`").replace(/"/g,"\\\"") + "\"| solc --combined-json abi,devdoc";
    var out = JSON.parse( child_process.execSync(cmd, {encoding:'utf8'})).contracts;
     
    let keys = Object.keys(out);
      
    var contracts = {};
    _.each(out, ( contract, name ) => {
      contracts[name] = {
          "abi": JSON.parse( contract['abi'] ),
          "doc": JSON.parse( contract["devdoc"] )
        };
    })
    
    return contracts;
  };

  var addContractToJson = ( json, contracts ) => {
    
    _.each(contracts, ( spec, name ) => {
      
      // if contract is't added as a dependency
      if( !json.dependencies[name] ) {
        
        json.contracts[name] = spec;
        
      }
      
    });
    
  };

  var compileContracts = function( working_dir, files ) {
    
    // CONTRACT -> CODE
    var contracts      = {};
    var imported       = {};
    var compiled       = {};
    var contractsPath  = "";
    
    // CODE -> CODE
    // substitude imports
    var importContract = function( code ) {
      // TODO - test nested imports and cyclus
      
      let code_ = code.replace(/import ('|")[^'"]+('|");/g, (match) => {
        match = match.replace(/'/g, '"');
        var import_name = match.split('"')[1];
        
        if( imported[import_name + '.sol'] ) return "";
        
        if( contracts_[import_name+'.sol'] ) {
          var importCode = 
           importContract( contracts_[ import_name + '.sol' ] ) || "";
        } else if( fs.existsSync( contractsPath + '/' + import_name + '.sol') ) {
          var importCode = 
           importContract( fs.readFileSync( contractsPath + '/' + import_name + '.sol', "utf8" ) ) || "";
        } else {
          throw new Error(`Imported file ${import_name} could not be found`);
        }
        
        return importCode;
      });
      
      return code_;
    }
      
    var solFiles = files.filter( f => {
      return (/.*\.sol$/g).test( f ) 
    });
    
    // Handle Includes
    solFiles.forEach( ( path_to_file ) => { 
      
      if( contractsPath === "" ) contractsPath = path.dirname( path_to_file );

      // Copied from truffle
      var code = fs.readFileSync( working_dir + '/' + path_to_file, "utf-8");
      
      // Remove comments - removing the comments also removes 
      // code = code.replace(/(\/\/.*(\n|$))/g, "");
      // code = code.replace(/(\/\*(.|\n)*?\*\/)/g, "");
      // code = code.replace("|)}>#", ""); // Edge case.
      
      contracts[ path.basename(path_to_file) ] = code;
      imported[ path.basename(path_to_file) ] = false;
     
    });
      
    var contracts_ = contracts;
    _.each(contracts, ( code, name ) => {
      
      imported = {[name]: true };
      var code_ = importContract( code );
      
      var contracts = compileContract( code_ );
      
      _.extend( compiled, contracts );
      // addContractToJson( json, contracts );
     
    });
    
    return compiled;
  }









  // external JSON
  var validateJson = function( working_dir, json ) {
    
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
    if( !fs.existsSync( working_dir + '/.spore') ) 
      fs.mkdirSync( working_dir + '/.spore');
    fs.mkdirSync( working_dir + '/.spore/build');
    json.files.forEach( ( file ) => {
      fs.copySync( working_dir + '/' + file, working_dir + '/.spore/build/' + file );
    });
    
    var rootHash = config.ipfs.addSync( working_dir + "/.spore/build/", {"r": true} );
    
      fs.removeSync( working_dir + '/.spore' );
     
      // publish name and ipfs link to contract
      var packageDirHash = rootHash.find( (o) => { return o.Name === 'build'; }).Hash;
      
      return packageDirHash;
      
    }

    var addJsonToIPFS = function( json ) {
      
      var jsonHash = config.ipfs.addJsonSync( json );
      
      return jsonHash;
      
    }



  var assertOwnership = function( name ) {
    var addr = config.spore.getOwnerSync( name );
    if( addr != '0x0000000000000000000000000000000000000000' 
       && addr != web3.eth.defaultAccount ) 
     throw new Error(`Package with name ${json.name} is already owned by ${addr}`);
  }
  
  // Check if spore.json has the right format
  // let json = JSON.parse(fs.readFileSync( working_dir + '/spore.json', 'utf8' ));
  validateJson( config.working_dir, config.pkg.json );
  
  
  // Check if name isn't taken, yet or the owner owns the package name
  assertOwnership( config.pkg.json.name );

  var ipfsNode = publishFiles( config.working_dir, config.pkg.json );
  
  var json = _.clone( config.pkg.json );
  
  json.root = ipfsNode;
  
  var solcVersion = child_process.execSync("solc --version", {encoding: 'utf8'})
    .split('/')[0]
    .split(' ')[1];
  
  json.solc = solcVersion;
  
  // Compile Contracts
  var compiledContracts = compileContracts( config.working_dir, json.files );
  
  
  // pick the contracts specified in the json
  json.contracts = _.pick( compiledContracts, json.contracts );
  
  // transform json to internal
  delete json.files;
  delete json.ignore;
  
  var jsonHash = addJsonToIPFS( json );
    
  // TODO - Check if cliet has funds to publish the package
  // web3.eth.estimateGas({
  //   to: address, 
  //   data: 
  // });
  // 
  // Inform the user about the gas price
  if( config.cli )
    console.log('brace yourself, gas will be spend!');
  
  var tx = config.spore.registerPackageSync( json.name, jsonHash, { gas: 300000 } );

  // var receipt = web3.eth.getTransactionReceipt( tx );
  // console.log( receipt );
  
  return jsonHash;
  
}

module.exports = publish;
