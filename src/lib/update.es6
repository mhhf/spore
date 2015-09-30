var fs = require('fs-extra');
var _  = require('underscore');


module.exports = function( config ) {
  
  var obj = config.spore.getPackagesArraySync();
  obj = _.invert( obj );
  
  var npm_location = process.env.SPORE_NPM_LOCATION;
  if( fs.existsSync( npm_location + '/db.json' ) ) {
    var dbfile = fs.readFileSync( npm_location + 'db.json' );
    var oldDb = JSON.parse(dbfile);
    
    var oldKeys = Object.keys( oldDb );
    var newKeys = Object.keys( obj );
    var intersect = _.intersection(oldKeys, newKeys);
    
    intersect.forEach( hash => {
      obj[hash] = oldDb[hash];
    })
    
    var toGrab = _.difference( newKeys, intersect );
  } else {
    var toGrab = Object.keys( obj );
  }
  
  var updated = [];
  toGrab.forEach( hash => {
    updated.push( obj[hash] );
    
    obj[ hash ] = { 
      name: obj[hash],
      header: config.ipfs.catJsonSync( hash )
    }
  });
  
  fs.outputFileSync( npm_location + '/db.json', JSON.stringify(obj) );
  
  if( config.cli ) {
    if( updated.length > 0 ) {
      console.log( 'Packages updated: ' + updated.join(', ') );
    } else {
      console.log('All packages up to date.');
    }
  }
  
};
