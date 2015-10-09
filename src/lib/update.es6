var fs = require('fs-extra');
var _  = require('underscore');


module.exports = function( config ) {
  
  var pkgs = config.contracts.spore().getPackagesArraySync();
  pkgs = _.invert( pkgs );
  
  var npm_location = process.env.SPORE_NPM_LOCATION;
  if( fs.existsSync( npm_location + '/db.json' ) ) {
    var dbfile = fs.readFileSync( npm_location + 'db.json' );
    var oldDb = JSON.parse(dbfile).pkgs;
    
    var oldKeys = Object.keys( oldDb );
    var newKeys = Object.keys( pkgs );
    var intersect = _.intersection(oldKeys, newKeys);
    
    intersect.forEach( hash => {
      pkgs[hash] = oldDb[hash];
    })
    
    var toGrab = _.difference( newKeys, intersect );
  } else {
    var toGrab = Object.keys( pkgs );
  }
  
  var updated = [];
  toGrab.forEach( hash => {
    updated.push( pkgs[hash] );
    
    pkgs[ hash ] = { 
      name: pkgs[hash],
      header: config.ipfs().catJsonSync( hash )
    }
  });
  
  fs.outputFileSync( npm_location + '/db.json', JSON.stringify({updated: new Date(), pkgs}) );
  
  if( config.cli ) {
    if( updated.length > 0 ) {
      console.log( 'Packages updated: ' + updated.join(', ') );
    } else {
      console.log('All packages up to date.');
    }
  }
  
};
