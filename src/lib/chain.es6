var _ = require('underscore');

module.exports = function( config ) {
  
  var setup = require("./setup.es6")( config );
  
  if( config.list ) {
    _.each(config.chains, ( chain, name ) => {
      
      var selected = "";
      
      var isonline = setup.pingSpore( chain.host, chain.port, chain.address );
      var online = ( isonline ? 'ONLINE'.green : 'OFFLINE'.red );
      
      if( config.selected == name ) {
        selected = "SELECTED".yellow;
      } 
      
      console.log(`"${name}" ${online} ${selected}`)
      
      _.each(chain, ( v, k ) => {
        console.log( `  ${k}: ${v}` );
      });
      console.log('\n');
    });
  } else if( config.add ) {
    config.addChain( config['<name>'] );
  } else if( config.select ) {
    config.selectChain( config['<name>'] );
  } else if( config.remove ) {
    config.removeChain( config['<name>'] );
  }

}
