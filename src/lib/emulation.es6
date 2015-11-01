var VM = require('ethereumjs-vm');
var Account = require('ethereumjs-account');
var async = require('async');
var utils = require('ethereumjs-util');
var Trie = require('merkle-patricia-tree');
var Transaction = require('ethereumjs-tx')
var deasync = require('deasync');

//the private/public key pare. used to sign the transactions and generate the addresses
var secretKey = '3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511'
var publicKey = '0406cc661590d48ee972944b35ad13ff03c7876eae3fd191e8a2f77311b0a3c6613407b5005e63d7d8d76b89d5f900cde691497688bb281e07a5052ff61edebdc0'
var addr;

//creating a trie that just resides in memory
var stateTrie = new Trie();

var vm = new VM(stateTrie);


//sets up the initial state and runs the callback when complete
function setup(cb) {
  //the address we are sending from
  var address = utils.pubToAddress(new Buffer(publicKey, 'hex'))
  addr = address;

  //create a new account
  account = new Account();

  //give the account some wei.
  //This needs to be a `Buffer` or a string. all strings need to be in hex.
  account.balance = 'f00000000000000001'
  
  //store in the trie
  stateTrie.put(address, account.serialize(), function() {
    
    vm.trie.get(addr, function(err,res) {
      cb();
    });
  });
  

}

//runs a transaction through the vm
function runTx(raw, cb) {
  //create a new transaction out of the json
  var tx = new Transaction(raw)

  tx.sign(new Buffer(secretKey, 'hex'))
  

  //run the tx
  vm.runTx({tx: tx, from: addr.toString('hex')}, function(err, results) {
    // console.log(err, results);
    var code = results.vm.return.toString('hex');
    cb( err, code );
  })
}


module.exports = function() {
  
  var execInit = function( code, cb ) {
    
    var rawTx = {
      nonce: '0x00',
      gasPrice: '0x00000e72a000',
      gasLimit: '0x90710',
      data: code 
    }
    
    //and finally
    //run everything
    async.series([
      setup,
      async.apply(runTx, rawTx)
    ], function(err,res) {
      cb(err,res[1]);
    });
    
  }
  var execInitSync = deasync(execInit);
  
  
  return {
    execInit,
    execInitSync
  };
  
}


