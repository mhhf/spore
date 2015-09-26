var _               = require('underscore');
var fs              = require('fs');
var SPORE           = require('./spore.es6');
var IPFS            = require('./ipfs.es6');
var PKG             = require('./package.es6');
var colors          = require('colors');


var working_dir = process.env.SPORE_WORKING_DIR;
var npm_location = process.env.SPORE_NPM_LOCATION;
var home = process.env.HOME || process.env.USERPROFILE;

var config_location = home + '/.spore_.json';

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
  
  var cfg = _.extend( config || {}, env, options ); 
  if( !cfg.working_dir && working_dir ) cfg.working_dir = working_dir;
  
  cfg.initSpore = function() {
    var remote = cfg.selected;
    cfg.spore = SPORE( cfg.chains[remote].host, cfg.chains[remote].port, cfg.chains[remote].address );
  }
  
  cfg.initIpfs = function() {
    cfg.ipfs = IPFS( cfg.ipfs_host, cfg.ipfs_port );
  }
  
  cfg.initPkg = function() {
    cfg.pkg = PKG( cfg );
  }
  
  cfg.initAll = function() {
    cfg.initSpore();
    cfg.initIpfs();
  }
  
  cfg.addChain = function( name ) {
    var chain = Setup.addChain();
    env.chains[name] = chain;
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
