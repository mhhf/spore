var _               = require('underscore');
var fs              = require('fs');
var SPORE           = require('./spore.es6');
var Instance        = require('./instance.es6');
var IPFS            = require('./ipfs.es6');
var PKG             = require('./package.es6');
var __package       = require('../../package.json');
var colors          = require('colors');
var Web3            = require('web3');
var web3;

var client_protocol_version = '0.0.3';
var ipfs_protocol_version = '0.0.3';

var working_dir = process.env.SPORE_WORKING_DIR;
var npm_location = process.env.SPORE_NPM_LOCATION || __dirname; 
var home = process.env.HOME || process.env.USERPROFILE;

var config_location = home + '/.sporerc';

var env; // = require( home + '/.spore.json' );


module.exports = function ( config, options ){
  
  var Setup = require('./setup.es6')( options || {} );
  
  var saveConfig = function() {
    fs.writeFileSync( config_location, JSON.stringify( env, false, 2 ) );
  }
  
  var loadConfig = function() {
    
    if( !fs.existsSync( config_location ) ) {
      env = Setup.setupAll();
      saveConfig();
    } else {
      env = JSON.parse( fs.readFileSync( config_location, 'utf8' ) );
    }
    
  }
  loadConfig();
  
  
  
  var cfg = _.extend( config || {}, env, options, {
    version: __package.version,
    client_version: __package.spore.client_version,
    ipfs_version: __package.spore.ipfs_version
  }); 
  
  if( !cfg.working_dir && working_dir ) cfg.working_dir = working_dir;
  
  cfg.logger = require('./log.es6')( cfg );
  cfg.log = cfg.logger.log;
  
  var ipfs;
  cfg.ipfs = function() {
    if( !ipfs ) {
      ipfs = IPFS( cfg.ipfs_host, cfg.ipfs_port );
      try {
        var res = ipfs.catSync('QmeomffUNfmQy76CQGy9NdmqEnnHU9soCexBnGU3ezPHVH')
      } catch ( e ) {
        console.log('Error: '.red + 'No IPFS connection could be established. Is the daemon running on localhost?', e);
        process.exit();
      }  
    }
    return ipfs;
  }
  
  var web3Init = false;
  cfg.web3 = function() {
    if( !web3Init ) {
      var remote = cfg.selected;
      var host = cfg.chains[remote].host;
      var port = cfg.chains[remote].port;
      if( cfg.test ) {
        host = 'localhost';
        port = '8545';
      }
      web3 = new Web3(new Web3.providers.HttpProvider(`http://${host}:${port}`));
      
      if( !web3.isConnected() ) {
        console.log('ERROR'.red+`: can't connect to rpc network on ${host}:${port}.`);
        process.exit();
      }
      
      web3.eth.defaultAccount = web3.eth.coinbase;
      // if( !(/TestRPC/).test( web3.version.client ) )
      //   cfg.log(web3.eth.getBlock(0).hash.toString());
    }
    return web3;
  }
  
  // cfg.initPkg = function() {
  //   cfg.pkg = PKG( cfg );
  // }
  
  var pkg;
  cfg.pkg = function() {
    if( !pkg ) pkg = PKG( cfg );
    return pkg;
  }
  
  cfg.addBundle = function( name, obj ) {
    env.bin[name] = obj;
    saveConfig();
  }
  
  cfg.removeBundle = function( name ) {
    delete env.bin[name];
    saveConfig();
  }
  
  cfg.addChain = function( name ) {
    var chain = Setup.addChain();
    env.chains[name] = chain;
    if( Object.keys(env.chains).length === 1 ) env.selected = name;
    saveConfig();
  }
  
  cfg.selectChain = function( name ) {
    if( Object.keys( env.chains ).indexOf( name ) > -1 ) {
      env.selected = name;
      saveConfig();
    } else {
      console.log(`${name} is not a chain`.red);
    }
  }
  
  var instances = {};
  cfg.contracts = {
    instance: function() {
      if( !instances.instance ) instances.instance = Instance( cfg );
      return instances.instance;
    },
    spore: function() {
      if( !instances.spore ) instances.spore = SPORE( cfg );
      return instances.spore;
    }
  }
  
  cfg.removeChain = function( name ) {
    if( Object.keys( env.chains ).indexOf( name ) > -1 && Object.keys(env.chains).length > 0) {
      delete env.chains[name];
      if( env.selected == name ) {
        env.selected = Object.keys(env.chains)[0];
      }
      saveConfig();
    } else {
      console.log(`${name} is not a chain`.red);
    }
  }
  
  return  cfg;
}
