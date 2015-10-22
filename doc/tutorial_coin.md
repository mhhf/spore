## Making a custom Coin contract with spore and truffle

<!-- One of the basic features of the blockchain technology was the idea of a decentral value exchange.  -->
<!-- Bitcoin in its basic interpretation represents a currency where a user ballance and can transfear  -->
<!-- it to another user. -->


- [setup](#setup)
- [discover](#discover)
- [develop](#develop)
- [setup](#setup)
- [compile and deploy](#compile-and-deploy)
- [publish](#publish)


### setup

Here we make a custom Coin contract, test it, and make a package for others to use.
We will do this with truffle, so you will need [truffle](https://github.com/ConsenSys/truffle) and 
spore installed. Install both with:

```bash
$ npm -g i truffle eth-spore
```

Development on ethereum is usually done on a separate chain. Here we recommend using
[testrpc](https://github.com/ConsenSys/eth&#45;testrpc), which is build
on top of pyethereum. Install and run it with:
```bash
$ pip install eth-testrpc
$ testrpc
```


On your first run, spore will guide you trough a setup process. The package naming resolution is done on the ethereum chain, therefore a connection to a rpc node is required. If you don't provide an own rpc node, spore will access the chain trough a central rpc server `spore.memhub.io:8545`, but **the use of an own rpc node is highly recomended**. The package content and its header is stored on [ipfs](ipfs.io). Here Spore also provides a default fallback to the standard gateway on `gateway.ipfs.io:80`. For the full experience, please install ipfs and use it locally. 

We will further assume that you have connected spore with an own rpc node and local ipfs.



<!--  Contracts in ethereum are compiled down to an assembly like language for the EVM (Ethereum Virtual Machine) where the code is executed. Ethereums special feature is that every code execution is timestaped  -->

### discover

The ethereum foundation and others have already written coin contracts. Also there is a standard API for coin contracts, so that the coin can be openly traded on a decentralized exchange and easily accessed with a wallet. To see what other people have already done, we can search Spore for `Coin`:

Because Spore is a decentral package manager there is no server, where you can send your search query to. Therefore you'll have to download all package headers to your local machine and perform a local search. Depending on the amount of packages and your ipfs/rpc connection this may take a while.

Lets **update** its database:

```bash
$ spore update 
Packages updated: spore, owned, mortal, coin, spore_instance

```

Great. Now you have all package headers in your local database. Lets **search** for coins:


```bash
$ spore search coin
last update was a few seconds ago
Found 1 results for search coin: 

  coin: Coin proposal by ethereums standardized contract api

```

Awesome, there is already a coin package out there which we will use as a basis for own implementation.

Lets look on the **info** of this package:

```bash
$ spore info coin 
{
  "name": "coin",
  "version": "0.1.0",
  "description": "Coin proposal by ethereums standardized contract api",
  "dependencies": {},
  "contracts": {
    "currency": "QmeziEPS49PKRtchFEy4QRHYG25PYoTaqtHRA5NbsLrecq"
  },
  "tags": [],
  "root": "QmZaaK9DhBVTtGRDbTtPih5RsYmRZwd7vw6jHCWuXmcBHS",
  "solc": "0.1.3-4457170b",
  "pv": "0.0.8"
}

```

### develop

Now we **clone** this package to change it.

```bash
$ spore clone coin 
coin cloned!

```

This will create a `coin` directory containing all package files. In this tutorial
we will use truffle as our dev-framework, so we need to make a truffle project out of coin:

```
$ cd coin
```

```bash
$ truffle init:config 

```

Truffle uses the information in `config/app.json` on which contract to deploy, so we need to put our coin contract in here:



```
  ...
  "deploy": [
    "currency"
  ],
  ...
```

Now we want to extend the coin contract in such a way, that we keep the power to destroy it.
For this, there is also already a package which allows the creator of an contract to destroy it.

```bash
$ spore info mortal 
{
  "name": "mortal",
  "version": "0.1.0",
  "description": "alow suicide by owner.",
  "dependencies": {
    "owned": "QmdAtZ66QjSJ6AuyX6Vp3s7SVZXwrj7txf6GS3C9gBaoyd"
  },
  "contracts": {
    "mortal": "QmVca2MpQJTwpK4YZzi4Rea5txezQxALcdKsdcmCj42JLf"
  },
  "tags": [],
  "root": "QmVPB4M51FMWRN11xioYQe22hDjJ1ExyTUQBpcCD6tZK1d",
  "solc": "0.1.3-4457170b",
  "pv": "0.0.8"
}

```

Take a notice here, that a contract which is mortal has also be owned by somebody, 
therefore the package **mortal** depends on the package **owned**.

First we have to **install** this package:

```bash
$ spore install mortal 
Package mortal installed.

```

After this, we have to import and assign mortal to our contract `contracts/currency.sol`. The end result has to look like this:



```bash
$ head -5 contracts/currency.sol
import "mortal";
contract currency is mortal {

    struct Account {
        uint balance;

```

Take a notice here, that although we imported our mortal contract, its location 
is still somewhere in the `spore_packages` directory. To point the compiler
to the right file, we can simply use the **link** command which resolves all
missing imports with the correct ones:

```bash
$ spore link 
Changed import in contracts/currency.sol to ../spore_packages/mortal-Y9v8ruHW/contracts/mortal

```

This will leave `contracts/coin.sol` with: 

```bash
$ head -5 contracts/currency.sol 
import "../spore_packages/mortal-Y9v8ruHW/contracts/mortal";
contract currency is mortal {

    struct Account {
        uint balance;

```

### compile and deploy
Now we are ready to go and write some tests on our mortal coin contract:
`test/mortalcoin.js`




```bash
$  cat test/mortalcoin.js 
contract('currency', function(accounts) {

  it('has to be mortal', function(done) {
    
    // setup default account
    web3.eth.defaultAccount = web3.eth.coinbase;
    
    // get the instance
    var currencyInstance = currency.at( currency.deployed_address );
    
    // has to be a contract
    assert( web3.eth.getCode( currency.deployed_address ) > 2 );
    
    // kill the contract
    currencyInstance.kill().then( function( tx ){
      
      // has to be dead
      assert.equal( web3.eth.getCode( currency.deployed_address ), '0x' );
      done();
      
    });
    
  }); 

});


```

test it:
```bash
$ truffle test 
Using environment test.
Compiling contracts...


  Contract: currency
    ✓ has to be mortal (457ms)


  1 passing (656ms)


```

and deploy it:

```bash
$ truffle deploy -e production
```

This will deploy mortalcoin to your production environment. 
That was fast, right?

### publish
If you want to allow others the usage of **mortalcoin** along with your test
you can publish it as a package:
Change the name of the project from coin to mortalcoin in your `spore.json` file.
**Add** the tests file with:

```bash
$ spore add test/ 
Added Files:
test/mortalcoin.js

```

And **publish** your package:

```
$ spore publish 
```

Congratulation! 
You have successfully created an own currency and enable others to easily replicate your work.
