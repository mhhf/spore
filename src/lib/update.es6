var deasync         = require('deasync');
var _               = require('underscore');

var pkg = require('./package.es6');
var ipfs = require('./ipfs.es6')

var getLinkSync     = deasync( spore.getLink );

var update = function() {
  
  var names = _.keys( pkg.json.dependencies );
  
  var newDeps = names.map( name => {
    
    let newLink = getLinkSync( name );
    let oldLink = pkg.json.dependencies[ name ];
    
    // return ( newLink != oldLink )? {name,newLink}: null;
    return {name,newLink};
  }).filter( o => o !== null );
  
  // newDeps.forEach( o => {
  //   
  //   pkg.removeDep( o.name );
  //   
  // });
  

  // TODO - known issue:
  // if an error occurs while installing the package
  // there won't be a rollback
  // 
  // TODO - dep removing is not nested
  newDeps.forEach( o => {
    
    pkg.removeDep( o.name );
    
  });
  
  newDeps.forEach( o => {
    
    pkg.installDep( name );
    
  });
  
};

module.exports = update;
