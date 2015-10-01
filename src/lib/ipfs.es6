"use strict";

var deasync         = require('deasync');
var async           = require('async');
var fs              = require('fs-extra');
var _               = require('underscore');

function IPFS ( host, port ) {
   
  // https://github.com/ConsenSys/ipfs.js
  var ipfs = require('ipfs-js');

  // Setup IPFS
  ipfs.setProvider( require('ipfs-api')( host, port ) );
  

  var lsSync         = deasync( ipfs.api.ls );
  var catSync        = deasync( ipfs.cat );
  var addSync        = deasync( ipfs.api.add );
  var addJsonSync    = deasync( ipfs.addJson );
  var catJsonSync    = deasync( ipfs.catJson );




  // IPFS-Hash -> [PATH]
  var mapAddressToFile = function( addr, absPath, cb ) {
    
    var node = lsSync( addr );
    
    var dirs = node.Objects[0].Links
      .filter( n => { return n.Type === 1} )
      .map( ( n ) => {
        return (cb) => {
          mapAddressToFile( n.Hash, absPath + n.Name + '/', cb);
        };
      });
    
    var files_ = node.Objects[0].Links
      .filter( n => { return n.Type === 2 })
      // .map( n => { return absPath + n.Name; });
      .map( n => { return {[absPath + n.Name]:n.Hash}; });
    
    async.parallel(dirs, ( err, files ) => {
      let objArr = _.flatten(files.concat( files_ ));
      let obj = objArr.reduce( ( e, o ) => _.extend( o,e ), {} );
      cb( err, obj );
    });
    
  }
  var mapAddressToFileSync = deasync( ( addr, cb ) => mapAddressToFile( addr, '', cb ) );
  
  








  var checkoutFiles = function( working_dir, files, cb ) {
    
    _.each(files, ( hash, path ) => {
      
      var data = catSync( hash );
      
      // Don't overwrite existing files
      if( fs.existsSync( path ) ) {
        // console.log(`File ${path} already exists.`.red);
      }
      fs.outputFileSync( working_dir + '/' + path, data );
      
    });
    
    cb();
    
  }
  var checkoutFilesSync = deasync( checkoutFiles );
  





  
  return {
    addSync,
    addJsonSync,
    lsSync,
    catSync,
    catJsonSync,
    mapAddressToFileSync,
    checkoutFilesSync,
    checkoutFiles
  }; 
  
}


module.exports = IPFS;
