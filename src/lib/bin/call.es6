"use strict";

var Web3            = require('web3');
var _ = require('underscore');
var docopt = require('docopt');
var deasync = require('deasync');
var Pudding = require('ether-pudding');
var Spinner = require('cli-spinner').Spinner;
require('colors');

// TODO - test if connected to web3
module.exports = function( config ) {
  
  
  var caller = config['<name>'];
  
  var abi = config.bin[caller].contract.abi;
  var address = config.bin[caller].address;
  var chain = config.bin[caller].chain;
  
  var abiCapabilities = abi.filter( f => f.type === 'function' ).map( f => {
    let params = f.inputs.map( i => '<'+( i.name || i.type )+'>').join(' ');
    return `  ${ caller } ${ f.name } ${ params }`;
  }).join('\n');


  var cli = 'Usage:\n' + `  ${caller} info` + '\n' + abiCapabilities;
  var instance, web3;
  if( chain === config.selected ) {
    // Contract = Pudding.whisk( abi );
    // instance = config.web3().eth.contract( abi ).at( address );
    web3 = config.web3();
    Pudding.setWeb3( web3 );
    instance = Pudding.whisk( abi ).at( address ); 
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(`http://${config.chains[chain].host}:${config.chains[chain].port}`));
    // instance = web3.eth.contract( abi ).at( address );
    Pudding.setWeb3( web3 );
    instance = Pudding.whisk( abi ).at( address ); 
  }
  
  var app = docopt.docopt(cli, {
    argv: config['<args>'],
    help: false
  });
  
  var waitTillSuccess = function( tx, cb ) {
    var filter = config.web3().eth.filter('latest', function(error, result){
      console.log(tx, result);
      if (error) cb( error )
      else if( tx == result ) { 
        filter.stopWatching();
        cb(null, true); 
      }
    });
  }
  var waitTillSuccSync = deasync( waitTillSuccess );
  
  
  
  if( app.info ) {
    
    var cli = 'Usage:\n' + abi
    .filter( f => f.type === 'function' )
    .map( f => {
      let params = f.inputs.map( i => '<'+( i.name || i.type )+'>').join(' ');
      let doc = config.bin[caller].contract.doc.methods[f.name+'('+_.pluck( f.inputs, 'type' ).join(',')+')' ];
      let paramDoc = _.map( doc && doc.params, 
                           (d, n) => '    '+n+':'+f.inputs.find( i => i.name === n ).type +' - '+d+'\n'
                          ).join('');
      return `  ${ caller.yellow } ${f.name.yellow } ${params.yellow } ${f.constant?'\n  CONSTANT':''} ${doc && '\n  '+doc.details || ''}\n${paramDoc}`;
    }).join('\n');
    
    console.log(`${address.slice(0,10)}... @ ${chain}( http://${config.chains[chain].host}:${config.chains[chain].port} )`);
    
    console.log(cli);
  
  } else {
    var fno = abi.find( a => app[a.name] );
    
    
    if( fno.constant ) {
      
      instance[ fno.name ].call.apply(instance, config['<args>'].slice(1))
      .then( res => console.log(res.toString()))
      .catch( err => console.log(err));
      
    } else {
      
      var spinner = new Spinner('%s sending... ');
      spinner.setSpinnerString(9);
      spinner.start()
      
      var tx = instance[ fno.name ]
      .apply(this, config['<args>'].slice(1))
      .then( tx => { 
        spinner.stop( true );
        console.log('success'); })
      .catch( err => console.log(err))
      
    }
  }
  

  
  // var address, args, contractName;
  //
  // var pkg = config['<package>'];
  //
  // var ipfsLink = config.contracts.spore().getLinkSync( pkg );
  //
  // var head = config.ipfs().catJsonSync( ipfsLink );
  //
  // if( Object.keys(head.contracts).length == 0 ) {
  //   throw Error('no contract in this package');
  // } else if( Object.keys(head.contracts).length === 1 ) {
  //   contractName = Object.keys(head.contracts)[0];
  // } else if( !config['<contract>'] ) {
  //   throw Error('no contract specified');
  // } else {
  //   contractName = config['<contract>'];
  // }
  //
  // var contract = config.ipfs().catJsonSync( head.contracts[contractName] );
  //
  // var abi = contract.abi;
  // // console.log(JSON.stringify(abi,false,2));
  // // 
  // let caller = `spore call ${pkg} --contract ${contractName}`
  //
  // var cli = 'Usage:\n' + abi.filter( f => f.type === 'function' ).map( f => {
  //   let params = f.inputs.map( i => '<'+( i.name || i.type ).green+'>').join(' ');
  //   let doc = contract.doc.methods[f.name+'('+_.pluck( f.inputs, 'type' ).join(',')+')' ];
  //   let paramDoc = _.map( doc && doc.params, 
  //                        (d, n) => '    '+n+':'+f.inputs.find( i => i.name === n ).type +' - '+d+'\n'
  //                       ).join('');
  //   return `  ${ caller } ${f.name.red} ${params} ${doc && '- '+doc.details || ''}\n${paramDoc}`;
  // }).join('\n')
  //
  // console.log(cli);
  //
  // return true;

}
