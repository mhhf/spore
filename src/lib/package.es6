"use strict";

var fs          = require('fs-extra');
var tv4         = require('tv4');
var colors      = require('colors');
var _           = require('underscore');
// var ipfs        = require('./ipfs.es6');
var deasync     = require('deasync');
var async       = require('async');

var SPORE           = require('./spore.es6');
var IPFS            = require('./ipfs.es6');

// var getLinkSync = deasync( spore.getLink );
// var working_dir = process.argv[2];

function Package( config ) {
  
  var spore = SPORE( config.eth_host, config.eth_port, config.spore_address );
  var ipfs = IPFS( config.ipfs_host, config.ipfs_port );

  // check if package is installed
  // Check if spore.json has the right format
  let json = JSON.parse(fs.readFileSync( config.working_dir + '/spore.json', 'utf8' ));
  if( !tv4.validate( require('../user_spec.json'), json ) ) throw tv4.error;
  
  // PKG_NAME -> BOOLEAN
  var isDependency = function( name ) {
    return _.keys(json.dependencies).indexOf( name ) > -1;
  }
  
  var assertDependency = function( name ) {
    if( !isDependency( name ) ) {
      console.log( `Package "${name}" is not a Dependency.`.yellow );
      process.exit();
    }
  }
  
  var getDependencyLink = function( name ) {
    return json.dependencies[name];
  }
  
  var saveJson = function() {
    fs.writeFileSync( config.working_dir + '/spore.json', JSON.stringify( json, false, 2 ));
  }
  
  // TODO - nested deps
  var removeDep = function( name ) {
    
    var ipfsAddress = getDependencyLink( name );

    var pkgJson = ipfs.catJsonSync( ipfsAddress );

    var files = _.keys(ipfs.mapAddressToFileSync( pkgJson.root ));

    files.forEach( path => {

      let index = json.ignore.indexOf( path );
      if( index === -1 ) return null;
      json.ignore.splice( index, 1 );

      fs.removeSync( path );

    });

    delete json.dependencies[name];

  }
  
  var addToIgnore = function( files ) {
    json.ignore = _.uniq( json.ignore.concat(files) );
  }
  

  var pkgDeps = [];
  
  // Serialize the package Tree and check for problems
  // { NAME => ADDRESS }
  var serializeDepTree = function( deps, cb ) {
    
    var fnMap = _.keys(deps).filter( name => {
      if( typeof pkgDeps[name] === "undefined" ) {
        pkgDeps[name] = deps[name];
        return true;
      }
      if ( pkgDeps[name] != deps[name] ) 
        throw new Error(`Two packages are depending on different versions of ${name}`);
      return false;
    }).map( name => {
      return (cb) => {
        var deps_ = ipfs.catJsonSync( deps[name] ).dependencies;
        serializeDepTree( deps_, (err, res) => {
          cb(err, res);
        } );
      }
    });
    
    async.parallel( fnMap, ( err, res ) => {
      let extended = res.reduce( ( e, o ) => _.extend( o, e ), deps );
      cb(null, extended);
    } );
  }
  var serializeDepTreeSync = deasync( serializeDepTree );
  
  








  var installDep = function( config ) {
    
    var ipfsAddress = spore.getLinkSync( config.package_name );
    let oldAddresses = _.values( json.dependencies );
    
    json.dependencies[ config.package_name ] = ipfsAddress;
    
    pkgDeps = _.clone( json.dependencies );
    var deps = serializeDepTreeSync( json.dependencies );
    let newAddresses = _.values( deps );

    let toInstall = _.difference(newAddresses, oldAddresses);

    var depFs = toInstall.map( addr => {
      return ( cb ) => { 
        var json = ipfs.catJsonSync( addr );
        var files = ipfs.mapAddressToFileSync( json.root );
        addToIgnore( _.keys(files) );
        ipfs.checkoutFiles( config.working_dir, files, cb );
      }
    });

    var parallelSync = deasync( async.parallel );
    var res = parallelSync(depFs);
  }
  








  return {
    json,
    assertDependency,
    getDependencyLink,
    saveJson,
    removeDep,
    addToIgnore,
    serializeDepTree,
    serializeDepTreeSync,
    installDep
  };
  
}


module.exports = Package
