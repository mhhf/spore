
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mhhf/spore?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)

**IMPORTANT: This is a proof of concept prototype and shouldn't be used in production**

![](named_logo.png)


For fast development of DApps a package management is needed. 
Spore is a Proof of Concept prototype for a such package manager build on top of truffle, ethereum and ipfs.

Any form on Feedback and contribution is highly wellcome.

## Installation

Make sure you have node v4+ installed:
```
$ node --version
v4.0.0
```

Install [ipfs](https://ipfs.io/docs/install/).

Install via: `npm i -g eth-spore`

On your first run spore will guide you trough a eth-rpc and ipfs configuration.
Currently a contract is located at **0x47aaaad8b87f3224e0ed566fc3e8282673c5f610** on the ConsenSys testnet.


## Usage
Run your local ipfs gateway and rpc client in seperate terminals:
```
ipfs daemon
```

```
Simple package management for Ethereum

Usage:
  spore init
  spore upgrade
  spore publish 
  spore add       <path>
  spore link
  
  spore info     [<package>]
  spore install   <package>
  spore clone     <package>
  spore uninstall <package>
  
  spore remote list
  spore remote select <name>
  spore remote add    <name>
  spore remote remove <name>
  
  spore update
  spore search <string>
  
  spore instance add <package> <address> --contract <contract>
  spore instance list <package>
  
Arguments:
  <package>                    Package name or hash
  <path>                       path to file/ directory
  <name>                       rpc settings name
  
Options:
  -v, --version                Shows the version of spore
  -h, --help                   Shows this help screen
  --verbose                    Shows interlal logs
```

## GUI

To it here for awesomeness (remember to set your ipfs cros settings correct): 
`http://localhost:8080/ipfs/QmVdS8wJFFrcibvLnTZ7P33rN9LrhbujHpryAHkmfpX37e/`

### Workflow
Create a new project:
```
mkdir mypackage 
cd mypackage
truffle init
spore init
```

this will create a spore.json in your root project directory:
```js
{
  "name": "mypackage",
  "version": "0.1.0",
  "description": "description",
  "dependencies": {},
  "contracts": [],
  "ignore": [],
  "files": []
}
```

install dependencies:
```
spore install LinkedList
spore install mortal
```

add some files:
```
spore add contracts/mycontract.sol
spore add readme.md
```

publish the package:
```
spore publish
```

Now you can install the package `mypackage` along with it's dependencies in another project via:
```
spore install new
```


## Development - Installation
This will guide you trough a **local** development installation. The contract is not deployed on a global chain, yet.

Make sure you have node v4+ installed:
```
$ node --version
v4.0.0
```

Make sure you have [solidity](https://github.com/ethereum/cpp-ethereum/wiki) installed:

```
$ solc --version
solc, the solidity compiler commandline interface
Version: 0.1.1-ed7a8a35/Release-Darwin/clang/JIT
```

Install [eth-testrpc](https://github.com/ConsenSys/eth-testrpc) for testing/ dev purposes.
`pip install eth-testrpc`

Install [truffle](https://github.com/ConsenSys/truffle).
`npm install -g truffle`

Install [ipfs](https://ipfs.io/docs/install/).

clone this repo:
`git clone https://github.com/mhhf/spore.git`

install:
```
cd spore
npm install
npm link
```
Run your rpc client( In this case testrpc `testrpc` )

Deploy the spore ethereum contract with: `truffle deploy`


## Test
Run a local chain:
`testrpc`

Deploy the contract:
`truffle deploy`

Run the test:
`mocha test`

## How it works
[This](https://github.com/mhhf/spore/blob/master/contracts/Spore.sol) Ethereum contract has a ` name => ipfs-hash ` mapping and some functionallity to access and manipulate it.

The ipfs-hash is pointing to a package-header which specified by [this](https://github.com/mhhf/spore/blob/master/src/ipfs_spec.json) json schema.
An example header for `mypackage` is:
```js
{
  "name": "mypackage",
  "version": "0.1.0",
  "description": "description",
  "dependencies": {
    "LinkedList": "QmYSigzKBexCogT6Nsmpz89qJUYYMZgZu8bmxejyf6AkAk",
    "mortal": "QmPtcRBPrTdV47s6iBTYcM72w6VmB3KmJ2VnyW1Zy3eu6A"
  },
  "contracts": {
    "Example": {
      "abi": [
        {
          "inputs": [],
          "type": "constructor"
        }
      ],
      "natspec": {
        "methods": {}
      }
    }
  },
  "root": "QmYJikcCRVKKLjLJpg6mYCeyNpobLZFijLwE4gM8iS6mRw"
}
```

The *dependencies* property contains packages with their ipfs header file.
The *root* property points to a ipfs directory node which contains the package files.
