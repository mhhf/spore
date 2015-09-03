/// @title Simple ethereum package proposal
/// @author Denis Erfurt
contract Spore {
  
  struct Package {
    address owner;
    string ipfs;
  }
  
  // Package Name => Package Object
  mapping (bytes32 => Package) packages;
  
  function Spore () {
    
  }
  
  function registerPackage( bytes32 name, string ipfs ) returns (bool){
    
    // Test if package already exists
    Package test = packages[name];
    if( test.owner != 0 && test.owner != msg.sender ) return false;
    
    packages[name] = Package( msg.sender, ipfs );
    
    return true;
  }
  
  function getLink( bytes32 name ) constant returns ( string link ){
    return packages[name].ipfs;
  }
  
  function getOwner( bytes32 name ) constant returns ( address owner ) {
    return packages[name].owner;
  }
  
}
