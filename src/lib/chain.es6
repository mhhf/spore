var _ = require('underscore');

module.exports = function( config ) {
  
  if( config.list ) {
    _.each(config.chains, ( chain, name ) => {
      console.log(name+':');
      
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
