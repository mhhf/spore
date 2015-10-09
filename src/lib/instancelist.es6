module.exports = function( config ) {
  
  var pkg = config['<package>'];
  if( pkg.length <= 32 ) { // Not IPFS - hash 
    pkg = config.contracts.spore().getLinkSync();
  }
  
  var arr =  config.contracts.instance().list( pkg );
 
  console.log(arr);
  
}
