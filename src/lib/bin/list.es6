"use strict";
var Table = require('easy-table')
var _ = require('underscore');

module.exports = function( config ) {
  var t = new Table();
  
  _.each( config.bin, ( obj, name ) => {
    
    t.cell("command", name);
    t.cell("package", obj.pkgName+` ( ${obj.pkg.slice(0,12)}... )`)
    t.cell("contract", obj.name);
    t.cell("address", obj.address.slice(0,12) + '...' );
    t.cell("chain", `${obj.chain} ( http://${config.chains[obj.chain].host}:${config.chains[obj.chain].port} ) `);
    t.newRow();
    
  });
  
  console.log( t.toString() );
};
