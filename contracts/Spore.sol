/// @title Simple ethereum package proposal v0.0.2
/// @author Denis Erfurt
contract Spore {
  
  struct Package {
    address owner;
    string ipfs;
  }
  
  /// @dev Array of all packages to iterate over.
  bytes32[] public packagesArray;
  
  /// @dev This will return the number of registered Packages.
  /// @return Number of packages.
  function numPackages() constant returns ( uint number ) {
    return packagesArray.length;
  }
  
  // Package Name => Package Object
  mapping (bytes32 => Package) packages;
  
  function Spore () {
    
  }
  
  /// @dev Add the package `name` to the map and array of packages iff its a new package or an update of the original owner.
  /// @param name Name of the package.
  /// @param ipfs Ipfs hash of the header-json.
  function registerPackage( bytes32 name, string ipfs ) returns (bool){
    
    // Test if package already exists
    Package test = packages[name];
    if( test.owner != 0 && test.owner != msg.sender ) return false;
    
    if( test.owner == 0 ) {
      packagesArray.length++;
      packagesArray[ packagesArray.length -1 ] = name;
    }
    
    packages[name] = Package( msg.sender, ipfs );
    
    return true;
  }
  
  /// @dev This will return the ipfs-hash of package `name` iff the package exists.
  /// @param name Name of the package.
  /// @return Ipfs Hash of the package header JSON file.
  function getLink( bytes32 name ) constant returns ( string link ){
    return packages[name].ipfs;
  }
  
  /// @dev This will return the owner of package `name` iff the package exists.
  /// @param name Name of the package.
  /// @return Address of the package owner.
  function getOwner( bytes32 name ) constant returns ( address owner ) {
    return packages[name].owner;
  }
  
  /// @dev This will return the current Spore version number.
  /// @return Current version number.
  function version( ) constant returns ( bytes32 ) {
    return "0.0.2";
  }
  
}
