var docopt = require('docopt');

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
console.log( docc );
