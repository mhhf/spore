"use strict"; 

var docopt = require('docopt');
var fs     = require('fs-extra');
var _      = require('underscore');
var CONFIG = require( '../config.es6' );
var readlineSync = require('readline-sync');
var vm     = require('../emulation.es6');
require('shelljs/global');

var binDir = process.env.SPORE_NPM_LOCATION+'/bin';

module.exports = function( config ) {
  
  // look if spore bin is in PATH to execute binaries out of the shell
  if( process.env.PATH.split(':').indexOf( binDir ) === -1 ) {
    let answer = readlineSync.question(`Your spore directory is not in your PATH variable.\nIts need to be, so that you can execute your bundles directly.\nDo you want to add spore bin to your local path? [y/n]:`);
    if( (/^y/).test( answer ) ) {
      fs.appendFile(process.env.HOME+'/.profile', `PATH="${binDir}:$PATH"`);
      console.log('please restart your shell session after this bundle'.yellow);
    }
  }
  
  var contractName;
  
  var pkg = config['<package>'];
  
  var ipfsLink = config.contracts.spore().getLinkSync( pkg );
  
  var head = config.ipfs().catJsonSync( ipfsLink );
  
  var cs = Object.keys(head.contracts);
  
  if( cs.length == 0 ) {
    throw Error('no contract in this package');
  } else if( cs.length === 1 ) {
    contractName = cs[0];
  } else {
    let c_id = readlineSync.question(`Multiple contracts found: \n${cs.map( (n,i) => i+' '+n ).join('\n')} Select one [0-${cs.length - 1}]:`);
    // TODO - error check
    contractName = cs[parseInt(c_id)];
  }
  
  var contract = config.ipfs().catJsonSync( head.contracts[contractName] );
  
  // console.log(contract);
  
  var abi = contract.abi;
  
  var address = readlineSync.question('Address of your contract: ');
  
  // TODO - test binary
  var bin = config.web3().eth.getCode(address);
  
  var res = vm().execInitSync( '0x'+contract.bin );
  // Test if contract is binary 
  if( res.slice(0,40) != bin.slice(2,42) ) {
    console.log('ERR'.red+' package contract is not deployed contract' );
    process.exit();
  }
  
  
  var caller = readlineSync.question(`executable name [${contractName.toLowerCase()}]:`) || contractName.toLowerCase();
  
  // Test if binary already exists in the path
  var path = which(caller);
  if( path !== null ) {
    console.log('ERR'.red+': system binary '+caller+' already exists and would be overwritten.');
    process.exit();
  }
  

  /* Track how many times the function name was used
   * 
   *  {
   *    [f.name]: 0
   *  }
   */
  var functionTracker = {};
  
  
  /* Interface
   *  
   * [{
   *   functionCall: "",
   *   functionName: "",
   *   params: "",
   *   doc: "",
   *   paramDoc: ""
   * }]
   */
  
  var cliO = abi
  .filter( f => f.type === 'function' )
  .map( f => {
    let params = f.inputs.map( i => '<'+( i.name || i.type )+'>').join(' ');
    let doc = contract.doc.methods[f.name+'('+_.pluck( f.inputs, 'type' ).join(',')+')' ];
    let paramDoc = _.map( doc && doc.params, 
                         (d, n) => '    '+n+':'+f.inputs.find( i => i.name === n ).type +' - '+d+'\n'
                        ).join('');
    // return {
    //   functionCall: f.name,
    //   functionName: 
    // };
    return `  ${ caller.yellow } ${f.name.yellow } ${params.yellow } ${doc && '\n  '+doc.details || ''}\n${paramDoc}`;
  });


  var cli = 'Usage:\n' + cliO.join('\n');
  

  var docopt = 'Usage:\n' + abi.filter( f => f.type === 'function' ).map( f => {
    let params = f.inputs.map( i => '<'+( i.name || i.type )+'>').join(' ');
    return `  ${ caller } ${ f.name } ${ params }`;
  }).join('\n');
  
  console.log(docopt);
  
  var obj = {
    chain: config.selected,
    address,
    contract,
    name: contractName,
    pkg: ipfsLink,
    pkgName: pkg
  }
  
  config.addBundle( caller, obj );
  
  fs.outputFileSync( binDir+'/'+caller, '#!/bin/sh\nspore bin call '+caller+' $@');
  chmod('+x',binDir+'/'+caller);
  // make executable 
  
};
