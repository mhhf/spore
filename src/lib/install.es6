var tv4             = require('tv4');
var fs              = require('fs-extra');
var deasync         = require('deasync');
var async           = require('async');
var colors          = require('colors');
var path            = require('path');
var _               = require('underscore');

var getLinkSync     = deasync( spore.getLink );
var ipfsLsSync      = deasync( ipfs.api.ls );
var ipfsCatSync     = deasync( ipfs.cat );
var ipfsCatJsonSync = deasync( ipfs.catJson );


var working_dir = process.argv[2];

var install = function( name ){
  
  // Check if spore.json has the right format
  let json = JSON.parse(fs.readFileSync( working_dir + '/spore.json', 'utf8' ));
  if( !tv4.validate( require('../user_spec.json'), json ) ) throw tv4.error;
    
  var cloneDir = ( addr, absPath, cb ) => {
    
    var node = ipfsLsSync( addr );
    
    var map = node.Objects[0].Links.map( ( n ) => {
      let type = n.Type;
      let name = n.Name;
      let hash = n.Hash;
      
      let relPath = path.relative( working_dir, absPath );
      if( relPath === "" ) relPath = './';

      if( type === 1 ) // dir
        return (cb) => {
          // Only create dir if it dosn't exist
          if( !fs.existsSync( relPath + '/' + name ) )
            fs.mkdirSync(  relPath + '/' + name )
            
          cloneDir( hash, relPath + '/' + name, cb);
        };
        
      if( type === 2 ) // file
        return (cb) => {
          var data = ipfsCatSync( hash );
             
          // add files to ignore
          if( json.ignore.indexOf( `${relPath}/${name}` ) === -1 )
            json.ignore.push( `${relPath}/${name}` );
          
          // Don't overwrite existing files
          if( fs.existsSync( relPath + '/' + name ) ) {
            console.log(`File ${relPath}/${name} already exists.`.red);
          }
          fs.writeFileSync( relPath + '/' + name, data );
          
          console.log(`checkout ${relPath}/${name}`.green);
          cb();
        }
        
      return null;
    });
    
    async.parallel(map, cb);
    
  };
  
  var installPkgByAddress = function( ipfsAddress, cb ) {
    
    // check if pkg isn't allready installed
    if( json.dependencies[name] === ipfsAddress ) { // Package exists
      console.log(`Package "${name}" already installed.`.yellow);
      // process.exit();
    } else if( typeof json.dependencies[name] === "string" ) { // TODO - Update package
      // TODO - remove package files
    }
    
    var pkgJson = ipfsCatJsonSync( ipfsAddress );
    
    if( !tv4.validate( pkgJson, require('../ipfs_spec.json') ) ) throw new Error( tv4.error );

    // add new package to dependencies
    json.dependencies[name] = ipfsAddress;
    
    var depFs = _.values( pkgJson.dependencies ).map( addr => {
      return ( cb ) => { installPkgByAddress( addr, cb ); }
    });
    
    async.parallel( depFs, () => {
      cloneDir( pkgJson.root, working_dir, cb );
    });
    
  }
  
  var ipfsAddress = getLinkSync( name );
  
  var installPkgByAddressSync = deasync( installPkgByAddress );
  
  installPkgByAddressSync( ipfsAddress );
  
  fs.writeFileSync( working_dir + '/spore.json', JSON.stringify( json, false, 2 ));

};

module.exports = install;
