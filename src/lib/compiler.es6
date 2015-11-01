"use strict";
var tv4                 = require('tv4');
var fs                  = require('fs-extra');
var child_process       = require('child_process');
var _                   = require('underscore');
var path                = require('path');
var deasync             = require('deasync');



module.exports = function( config ) {
  

  var compileContract = function( code ) {
    
    
    var cmd = "echo \"" + code.replace(/`/g,"\\`").replace(/"/g,"\\\"") + "\"| solc --combined-json abi,devdoc,bin --optimize";
    var out = JSON.parse( child_process.execSync(cmd, {encoding:'utf8'})).contracts;
     
    let keys = Object.keys(out);
      
    var contracts = {};
    _.each(out, ( contract, name ) => {
      let c = {
          "abi": JSON.parse( contract['abi'] ),
          "doc": JSON.parse( contract["devdoc"] ),
          "bin": contract['bin']
        };
      
      contracts[name] = config.ipfs().addJsonSync( c );
    });

    
    return contracts;
  };

  // var addContractToJson = ( json, contracts ) => {
  //   
  //   _.each(contracts, ( spec, name ) => {
  //     
  //     // if contract is't added as a dependency
  //     if( !json.dependencies[name] ) {
  //       
  //       json.contracts[name] = spec;
  //       
  //     }
  //     
  //   });
  //   
  // };

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
  
  return {
    compileContracts
  }
  
}
