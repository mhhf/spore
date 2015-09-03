var docopt = require('docopt');

// https://github.com/ConsenSys/ipfs.js
var ipfs = require('ipfs-js');
// 
// Setup IPFS
ipfs.setProvider({host: 'localhost', port: '5001'});

var doc = `
Simple package management for Ethereum

Usage:
  spore info   <package>
  spore search <package>
  spore add    <package> 
  spore rm     <package>
  
Arguments:
  <package>               Package name 
  
Options:
  --version               Shows the Version of spore
`;


var docc = docopt.docopt(doc, {argv: process.argv.slice(2), help: true, version: '0.0.1' });


ipfs.cat("Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt", function(err, text) {
    if (err) throw err;
    console.log(text);  // "Testing..."
});
