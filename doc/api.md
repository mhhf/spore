## API Decumentation

- [help](#help)
- [init](#init)
- [upgrade](#upgrade)
- [publish](#publish)
- [add](#add)
- [link](#link)
- [info](#info)
- [install](#install)
- [clone](#clone)
- [uninstall](#uninstall)
- [remote list](#remote-list)
- [remote select](#remote-select)
- [remote remove](#remote-remove)
- [update](#update)
- [search](#search)
- [instance add](#instance-add)
- [instance list](#instance-list)


### help
```
$ spore --help 

Simple package management for Ethereum

Usage:
  spore init
  spore upgrade
  spore publish 
  spore add       <path>
  spore link
  
  spore info     [<package>]
  spore install  [<package>]
  spore clone     <package>
  spore uninstall <package>
  
  spore remote list
  spore remote select <name>
  spore remote add    <name>
  spore remote remove <name>
  
  spore update
  spore search <string>
  
  spore instance add <package> <address> [--contract <contract>]
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

### init
```
spore init
```

Initializes a new spore project in your directory. Will ask you about the project name,
version and (short) description of your project.

This will create a `spore.json` in your current directory:

##### Example
```
$ spore init

Name of your project [myproject]:
Version [0.1.0]: 0.0.1
Package description : My test project.

init spore

$ cat spore.json
{
  "name": "myproject",
  "version": "0.0.1",
  "description": "My test project.",
  "dependencies": {},
  "contracts": [],
  "ignore": [],
  "files": [],
  "tags": []
}
```

### upgrade
```
spore upgrade
```

Upgrade all top level dependencies to the newest version.

##### Example
```
$ spore upgrade
Packages updated:
 owned -> QmY9D8A1PHAWuXgbbF5VrkRmnjn1YHKFqDwsBCxys9TCQh
```

### publish
```
spore publish
```

Publishes your package to the current selected chain.
1. It compiles all contracts listed in your `spore.json` and adds them to your package header.
2. It pushes all files listed in your `spore.json` to ipfs and adds the root ipfs hash to the header.
3. The json Header is allso pushed to ipfs and its hash published to the spore contract.

##### Example
```
$ spore publish
brace yourself, gas will be spend!
Package published: Qma8aCXafZYjni9iWPoWRTiEAqrDY1C6qAKFri1gSpGBhK
```

### add
```
spore add <path>
```
Adds files to your `spore.json`. Path can point to a file or directory.

##### Example
```
$ spore add contracts
Added files:
contracts/mycontract.sol
contracts/myothercontract.sol
```

### link
```
spore link
```
Go trouh all your contracts, included in your `spore.json` and trys to replace `import` statements with your dependencies.

##### Example
You have the following `mortal.sol` contract:
```
import "owned"

contract mortal is owned {

...
```

Now the contract `owned` is a dependency you previously included via `spore install owned`, 
which is located in `spore_packages/owned-Y9D8A1PH/contracts/owned`.
To help your compiler find your dependency, just run:
```
spore link
```

and it replaces your import statement with a relative path to your dependent contract. Your `mortal.sol` contract will be looking like this:
```
import "../spore_packages/owned-Y9D8A1PH/contracts/owned";

contract mortal is owned {

...
```

### info
```
spore info [<package>]
```
Prints the info about a package. If no package is specified, it prints out the info of your current project.


##### Example
```
$ spore info spore
{
  "name": "spore",
  "version": "0.1.0",
  "description": "Simple package manager for dapp development.",
  "dependencies": {},
  "contracts": {
    "Spore": "Qmf34xWuPHtRdsH8RR4jYnbrBRBkJ6n9WfazX7Z65SCJ6V"
  },
  "tags": [
    "package",
    "manager",
    "test"
  ],
  "root": "QmPZWqn4ZRhGFJCTnNvaz3Wwe6inKQ4n6nJic4bAw3maz3",
  "solc": "0.1.3-4457170b",
  "pv": "0.0.3"
}
```

### install
```
spore install [<package>]
```

Install a specified package recursively with its dependencies.
Only the specified package will be add to your `spore.json` not its dependencies.
Also the content of all packages will be added to your `spore_packages` directory 
in your project folder. 

If no package is specified, it will forward to `spore upgrade`.

##### Example
```
$ spore install mortal
Package mortal installed.
```

### clone
```
spore clone <package>
```

This will clone `<package>` to your current directory.

##### Example
```
$ spore clone mortal
mortal cloned!

$ tree mortal
mortal
├── contracts
│   └── mortal.sol
└── spore.json

1 directory, 2 files
```

### uninstall
```
spore uninstall <package>
```

This will uninstall `<package>` from `spore.json` and also remove unneeded packages from `spore_packages`.

##### Example
```
$ spore uninstall owned
Package "owned" successful removed.
```

### remote list
```
spore remote list
```

Spore allows you to access multipe spore instances on multiple chains. 
This will print information and status of all instances and chains.

##### Example
```
$ spore remote list
"origin" ONLINE
  host: spore.memhub.io
  port: 8545
  address: 0x774b349719f8007bb479c5721e510d4803385d04


"testnet" ONLINE SELECTED
  host: 192.168.59.103
  port: 8545
  address: 0x774b349719f8007bb479c5721e510d4803385d04
  
  
"mainnet" ONLINE 
  host: 192.168.59.103
  port: 8546
  address: 0x295b5c7a5c533eb11ef3653769f089345384db4c
  
  
"test" OFFLINE
  host: localhost
  port: 8545
  address: 0x1234567891234567891234567891234567891234
```

### remote select
```
spore remote select <name>
```

Point to a spore instance in your list to get access to it.

##### Example
```
spore remote select origin
```

### remote add
```
spore remote add <name>
```

Add a new spore instance or chain to the list.

##### Example
```
spore remote add <name>
Ethereum rpc host ( xxx.xxx.xxx.xxx ): localhost
Ethereum rpc port [8545]:
```

### remote remove
```
spore remote remove <name>
```

Removes a chain and instance specification.

##### Example
```
spore remote remove origin
```

### update
```
spore update
```

Fetches **all** packages and their headers to a local database to make them searchable.
Currently in alpha and not production ready. This may take a while.

##### Example
```
$ spore update
Packages updated: mortal, coin
```

### search
```
spore search <string>
```

Search your local database for keywords.

##### Example
```
$ spore search manager
last update from 2015-10-09T17:27:32.108Z
Found 1 results for search manager:

  spore: Simple package manager for dapp development.
```

### instance add
```
spore instance add <package> <address> [--contract <contract>]
```

This is a addon with a seperate contract, which holds a list of deployed 
contract instances for every package.
Everybody can push a new instance.

The contract flag is optional and has to be set, if a package contains more then one contract.

##### Example 
```
$ spore instance add 0x774b349719f8007bb479c5721e510d4803385d04
```

### instance list
```
spore instance list <package>
```

This will list all instances found for a given package
##### Example
```
$ spore instance list spore
[ { name: 'Spore',
    addr: '0x774b349719f8007bb479c5721e510d4803385d04' } ]
```
