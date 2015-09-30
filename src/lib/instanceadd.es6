module.exports = function( config ) {
  
  var pkg = config['<package>'];
  if( pkg.length < 46 ) { // Not IPFS - hash 
    pkg = config.spore.getLinkSync();
  }
  
  config.instance().add( pkg, config['<address>'] );
  
  
}
