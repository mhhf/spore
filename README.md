
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mhhf/spore?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)

**IMPORTANT: This is a proof of concept prototype and shouldn't be used in production**


For fast development of DApps a package management is needed. 
Spore is a Proof of Concept prototype for a such package manager build on top of truffle, ethereum and ipfs.

Any form on Feedback and contribution is highly wellcome.



## Installation
This will guide you trough a **local** development installation. The contract is not deployed on a global chain, yet.

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

Deploy the spore ethereum contract with: `npm run truffle`

## Usage
Run your local ipfs node and rpc client in seperate terminals:
```
ipfs daemon
testrpc
```

```
$ spore --help
Simple package management for Ethereum

Usage:
  spore init
  spore publish 
  spore update
  spore info      <package>
  spore search    <package>
  spore install   <package>
  spore uninstall <package>
  spore add       <path>
  
Arguments:
  <package>                    Package name 
  <path>                       path to file/ directory
  
Options:
  -v, --version                Shows the Version of spore
  -h, --help                   Shows this Help Screen
```

## Test
`npm test`
