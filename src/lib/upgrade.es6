"use strict";

var deasync         = require('deasync');
var _               = require('underscore');

module.exports = function( config ) {
  
  var names = _.keys( config.pkg().json.dependencies );
  
  var newDeps = names.map( name => {
    
    let newLink = config.contracts.spore().getLinkSync( name );
    let oldLink = config.pkg().json.dependencies[ name ];
    
    // return ( newLink != oldLink )? {name,newLink}: null;
    return {name,newLink};
  }).filter( o => o !== null );
  
  // TODO - known issue:
  // if an error occurs while installing the package
  // there won't be a rollback
  // 
  // TODO - dep removing is not nested
  // newDeps.forEach( o => {
  //   
  //   config.pkg.removeDep( o.name );
  //   
  // });
  
  newDeps.forEach( o => {
    
    config.pkg().installDep( 'spore_packages', o.name );
    
  });
  
  config.pkg().saveJson();
  
  if( config.cli ) {
    if( newDeps.length === 0 ) {
      console.log( 'Nothing new.' );
    } else {
      console.log( 'Packages updated:\n', newDeps.map( o => o.name+' -> '+o.newLink ).join('\n') );
    }
  }
  
};
