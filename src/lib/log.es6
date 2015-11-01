var _ = require('underscore');

module.exports = function( config ) {
  
  var lvl = 3;

  var log = function( ) {
    if( false && !config['--verbose'] ) return false;
    if( typeof arguments[0] === 'number' ) {
      if(arguments[0] < lvl) 
        console.log(_.values(arguments).slice(1).join(' '));
    } else {
      console.log(_.values(arguments).map(f => {
        if( typeof f === 'object') return JSON.stringify(f);
        return f.toString();
      }).join(' '));
    }
  }

  return {
    log,
    lvl
  }

}
