"use strict"; 

var readlineSync = require('readline-sync');
var fs           = require('fs-extra');
var path         = require('path');
var _            = require('underscore');
require('shelljs/global');

var Ipfs         = require('./ipfs.es6');
var Web3         = require('web3');
var web3;
var colors       = require('colors');

module.exports = function ( options ) {
  
  
  var getAddrForChain = function( web3 ) {
    var testrpc = (/TestRPC/).test(web3.version.client);
    var bh = testrpc?'testrpc':web3.eth.getBlock(0).hash;
    if( bh === '0x34288454de81f95812b9e20ad6a016817069b13c7edc99639114b73efbc21368' ) {
      // Consensys Testnet 
      return '0x774b349719f8007bb479c5721e510d4803385d04';
    } else if ( bh === '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3' ) {
      // Frontier
      return '0x5067247f2214dca445bfb213277b5f19711e309f';
    } else {
      console.log('WARN'.yellow + ': Unknown chain.');
      var address = readlineSync.question('Point to the spore contract on this chain ( 0xXX..XX ): ') || '';
      if( web3.isAddress( address ) && web3.eth.getCode( address ).length > 2 ) {
        return address;
      } else {
        console.log('ERROR'.red+`: Address ${address} is not a valid contract.`);
        process.exit();
      }
    }
  }
  
  var addChain = function() {
    
    var eth_host = 'localhost';
    var eth_port = '8545';
    var spore_address = '0x774b349719f8007bb479c5721e510d4803385d04';
    
    if( options.cli ) {
    
      eth_host = readlineSync.question('Ethereum rpc host ( xxx.xxx.xxx.xxx ): ') || 'spore.memhub.io';
      eth_port = readlineSync.question('Ethereum rpc port [8545]: ') || '8545';
      // test rpc connection
      // 
      web3 = new Web3(new Web3.providers.HttpProvider(`http://${eth_host}:${eth_port}`)); 
      
      if( web3.isConnected() ) {
        spore_address = getAddrForChain( web3 );
      } else {
        console.log(`ERROR`.red + `: Could not connect to ${eth_host}:${eth_port}. Verify you rpc node is running.`);
        process.exit();
      }
      
    }
    
    return {
      host: eth_host,
      port: eth_port,
      address: spore_address
    };
    
  }
  
  var setupIpfs = function() {
    
    var ipfs_host = 'gateway.ipfs.io';
    var ipfs_port = '80';
    
    if ( options.cli ) {
      ipfs_host = readlineSync.question('IPFS host [localhost]: ') || 'localhost';
      ipfs_port = readlineSync.question('IPFS port [5001]: ') || '5001';
    }
    
    return {
      ipfs_host,
      ipfs_port
    };
  }
  
  var setupAll = function() {
    console.log('You are running spore for the first time. This will guide you trough the setup.');
    
    var obj = {};
    
    // Is IPFS Installed?
    if( !which('ipfs') ) { // No
      console.log(`No IPFS found on your system.
Will use trusted gateway.ipfs.io as default.
With this, you won't be able to publish packages.
Please install IPFS ( http://ipfs.io/docs/install ) and use the daemon on localhost, 
if you whish to publish packages or use spore in a decentralized way.\n`);
      obj.ipfs_host = 'gateway.ipfs.io';
      obj.ipfs_port = '80';
    } else {
      var apiAddress = JSON.parse( exec('ipfs config show', {silent:true}).output ).Addresses.API.split('/');
      obj.ipfs_host = apiAddress[2];
      obj.ipfs_port = apiAddress[4];
      console.log('SUCCESS'.green + `: Found ipfs on ${obj.ipfs_host}:${obj.ipfs_port}`);
      if( !pingIpfs( obj.ipfs_host, obj.ipfs_port ) ) {
        console.log('WARN'.yellow + ": Keep in mind to run `ipfs daemon` in the background, do be able to use spore.");
      }
    }
    
    
    web3 = new Web3(new Web3.providers.HttpProvider(`http://localhost:8545`));
    if( !web3.isConnected() ) {
      console.log("WARN".yellow + `: Could not find a rpc connection on localhost:8545.`);
      console.log(`If no chain information are provided this will use spore.memhub.io rpc client as default.`);
      console.log(`The remote client will be only available during an alpha test phase 
and only as long as it remains stable. It can be removed on any time. With this client 
you won't be able to publish packages. The usage of an own rpc node is highly recomended.`);
      var point = readlineSync.question('Do you want to to link to an own rpc chain? (y/n): ');
      if( (/^y/).test(point) ) {
        var name = 'origin';
        if( options.cli )
          name     = readlineSync.question('Name for your chain and spore contract [origin]: ') || 'origin';
        obj.chains = {};
        obj.chains[name] = addChain(name);
        obj.selected = name;
      } else {
        obj.chains = {};
        obj.chains['origin'] = {
          host: 'spore.memhub.io',
          port: '8545',
          address: '0x774b349719f8007bb479c5721e510d4803385d04'
        };
        obj.selected = 'origin';
      }
    } else {
      console.log('SUCCESS'.green + ` Found rpc client on localhost:8545`);
      obj.chains = {};
      obj.selected = 'origin';
      obj.chains['origin'] = {
        host: 'localhost',
        port: 'port',
        address: getAddrForChain( web3 )
      };
    }
    
    obj.bin = {};
    
    return obj;
  }
  
  
  var pingSpore = function( host, port, address ) {
    
    try {
      web3 = new Web3(new Web3.providers.HttpProvider(`http://${host}:${port}`));
      var c = web3.version.client;
    } catch ( e ) {
      if( options.cli )
        console.log( "Cannot reach etheruem rpc server, please verify it is running." );
      return false;
    }
    
    
    var c = web3.eth.getCode( address );
    if ( c.length <= 2 ) {
      if( options.cli )
        console.log("Contract can't be found, try another address or deploy a new spore contract.");
      return false;
    }
    return true;
  }
  
  var pingIpfs = function( host, port ) {
    let ipfs = Ipfs( host, port );
    try {
      var res = ipfs.catSync('QmeomffUNfmQy76CQGy9NdmqEnnHU9soCexBnGU3ezPHVH')
      return true;
    } catch ( e ) {
      return false;
    }
  }
  
  var testParameters = function() {
    
    var sporeOnline = pingSpore( eth_host, eth_port, spore_address );
    
    var ipfsOnline = pingIpfs( ipfs_host, ipfs_port );
    
    return sporeOnline && ipfsOnline;
  };
  
  return {
    addChain,
    setupIpfs,
    setupAll,
    pingSpore,
    pingIpfs
  };
  
}
