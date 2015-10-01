"use strict";

var fs          = require('fs-extra');
var tv4         = require('tv4');
var colors      = require('colors');
var _           = require('underscore');
var deasync     = require('deasync');
var async       = require('async');
var path        = require('path');

function Package( config ) {

  // check if package is installed
  // Check if spore.json has the right format
  if( !fs.existsSync(config.working_dir + '/spore.json') ) {
    console.log('ERROR'.red + ": No spore environment found.");
    process.exit();
  }
  
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

    var pkgJson = config.ipfs().catJsonSync( ipfsAddress );

    var files = _.keys(config.ipfs().mapAddressToFileSync( pkgJson.root ));

    files.forEach( path => {

      let index = json.ignore.indexOf( path );
      if( index === -1 ) return null;
      json.ignore.splice( index, 1 );

      fs.removeSync( config.working_dir + '/' + path );

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
    config.log(4,'current pkgDeps: '+pkgDeps)
    config.log(4,'serializing deps: '+ JSON.stringify(deps));
    
    var fnMap = _.keys(deps).filter( name => {
      if( typeof pkgDeps[name] === "undefined" ) {
        pkgDeps[name] = deps[name];
        config.log('don\'t filter '+name);
        return true;
      }
      if ( pkgDeps[name] != deps[name] ) 
        throw new Error(`Two packages are depending on different versions of ${name}`);
      return false;
    }).map( name => {
      config.log(4,'d '+name);
      return (cb) => {
        var deps_ = config.ipfs().catJsonSync( deps[name] ).dependencies;
        config.log('rec dep: '+JSON.stringify(deps_));
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
  
  
  // Install flat:
  // A `spore_packages` directory in the root procejt directory is created.
  // It Contains all nested dependency packages
  // e.g.:
  //
  // spore_packages
  // ├── mortal-Qn4p5PNT
  // │   └── contracts
  // │       └── mortal.sol
  // └── owned-TEoYCRgy
  //     └── contracts
  //         └── owned.sol
  //         
  var installPkg = function( hash, dir, package_name ) {
    
    // Save current dependencies
    let oldAddresses = _.values( json.dependencies );
    
    // assign new dependency to list.
    json.dependencies[ package_name ] = hash;
    
    pkgDeps = _.values( json.dependencies );
    config.log('first level deps:', json.dependencies );
    
    var deps = serializeDepTreeSync( json.dependencies );
    config.log("deps: "+JSON.stringify(deps))
    
    let newAddresses = _.values( deps );
    
    let toInstall = _.difference(newAddresses, oldAddresses);
    config.log('to install: '+toInstall);
    
    toInstall.forEach( addr => {
      var json = config.ipfs().catJsonSync( addr );
      var files = config.ipfs().mapAddressToFileSync( json.root );
      var pkgDir = config.working_dir +'/'+ dir +'/'+ json.name+'-'+addr.slice(2,10);
      // addToIgnore( _.keys(files) );
      
      // Checkout package files
      config.log('checking out files: ',files);
      config.ipfs().checkoutFilesSync( pkgDir, files );
      
      // Link nested dependencies to flat structure
      config.log( `in pkg ${json.name} and linking nested dependencies: `, json.dependencies );
      if( Object.keys( json.dependencies ).length > 0 )
        fs.ensureDirSync( pkgDir+'/spore_packages');
      
      _.each(json.dependencies, function( hash, name ) {
        let src = `${config.working_dir}/${dir}/${name}-${hash.slice(2,10)}`;
        let dest = `${pkgDir}/spore_packages`;
        let relative = path.relative( dest, src );
        fs.symlinkSync( relative, `${dest}/${name}-${hash.slice(2,10)}` );
      });
    });
    
  }

  // Instal package package_name into wd
  var installDep = function( wd, package_name ) {
    
    // TODO - skip if package_name is already a hash
    var ipfsAddress = config.contracts.spore().getLinkSync( package_name );
    
    // Test if user made a typo
    if( ipfsAddress === "" ) { 
      if( config.cli )
        console.log(`no package ${package_name} found.`.red);
      return null;
    }
    
    installPkg( ipfsAddress, wd, package_name );
    
    // var depFs = toInstall.map( addr => {
    //   return ( cb ) => { 
    //     var json = config.ipfs.catJsonSync( addr );
    //     var files = config.ipfs.mapAddressToFileSync( json.root );
    //     addToIgnore( _.keys(files) );
    //     config.ipfs.checkoutFiles( config.working_dir++json.name+'-'+addr.slice(2,10), files, cb );
    //     config.log('checking out files: ',files);
    //   }
    // });
    //
    // var parallelSync = deasync( async.parallel );
    // var res = parallelSync(depFs);
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
