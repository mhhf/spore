"use strict"; 

var readlineSync = require('readline-sync');
var fs           = require('fs-extra');
var path         = require('path');

var Ipfs         = require('./ipfs.es6');
var web3         = require('web3');

module.exports = function () {
  
  console.log('You are running spore for the first time. A configuration file will be created in ~/.spore.json');
  //
  // var ipfsSetup = true;
  // var rpcSetup = true;
  // var contractSetup = true;
  
  var eth_host = readlineSync.question('Ethereum rpc host [localhost]: ') || 'localhost';
  var eth_port = readlineSync.question('Ethereum rpc port [8545]: ') || '8545';
  // test rpc connection
  
  var spore_address = readlineSync.question('Please point to ethereum address:') || '0x47aaaad8b87f3224e0ed566fc3e8282673c5f610'; // testnet contract
  
  var ipfs_host = readlineSync.question('IPFS host [localhost]: ') || 'localhost';
  var ipfs_port = readlineSync.question('IPFS port [5001]: ') || '5001';
  
  var testParameters = function() {
    
    try {
      web3.setProvider(new web3.providers.HttpProvider(`http://${eth_host}:${eth_port}`));
      var c = web3.version.client;
    } catch ( e ) {
      console.log( "Cannot reach etheruem rpc server, please verify its running." );
      return false;
    }
    
    
    var c = web3.eth.getCode( spore_address );
    if ( c.length <= 2 ) {
      console.log("Contract can't be found, try another address or deploy a new spore contract.");
      return false;
    }
    
    
    let ipfs = Ipfs( ipfs_host, ipfs_port );
    try {
      let addr = ipfs.addSync('test');
    } catch ( e ) {
      console.log( "Cannot reach ipfs deamon, try again." );
      return false;
    }
    
    return true;
  };
  

  var json = {
    eth_host,
    eth_port,
    spore_address,
    ipfs_host,
    ipfs_port
  };
  
  if( testParameters() ) {
    var home = process.env.HOME || process.env.USERPROFILE;
    fs.writeFileSync( home+'/.spore.json', JSON.stringify( json, false, 2 ) );
  } else {
    process.exit();
  }
  
}
