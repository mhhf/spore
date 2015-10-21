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

{{>spore update }}

Great. Now you have all package headers in your local database. Lets **search** for coins:


{{>spore search coin}}

Awesome, there is already a coin package out there which we will use as a basis for own implementation.

Lets look on the **info** of this package:

{{>spore info coin }}

### develop

Now we **clone** this package to change it.

{{>spore clone coin }}

This will create a `coin` directory containing all package files. In this tutorial
we will use truffle as our dev-framework, so we need to make a truffle project out of coin:
{{> cd coin }}
{{>truffle init:config }}

Truffle uses the information in `config/app.json` on which contract to deploy, so we need to put our coin contract in here:

{{!>sed -i.bak 's/Example/currency/g' config/app.json && rm config/app.json.bak }}

```
  ...
  "deploy": [
    "currency"
  ],
  ...
```

Now we want to extend the coin contract in such a way, that we keep the power to destroy it.
For this, there is also already a package which allows the creator of an contract to destroy it.

{{>spore info mortal }}

Take a notice here, that a contract which is mortal has also be owned by somebody, 
therefore the package **mortal** depends on the package **owned**.

First we have to **install** this package:

{{>spore install mortal }}

After this, we have to import and assign mortal to our contract `contracts/currency.sol`. The end result has to look like this:

{{!>sed -i.bak 's/contract currency {/import "mortal";\'$'\ncontract currency is mortal {/g' contracts/currency.sol && rm contracts/currency.sol.bak }}

{{>head -5 contracts/currency.sol}}

Take a notice here, that although we imported our mortal contract, its location 
is still somewhere in the `spore_packages` directory. To point the compiler
to the right file, we can simply use the **link** command which resolves all
missing imports with the correct ones:

{{>spore link }}

This will leave `contracts/coin.sol` with: 

{{>head -5 contracts/currency.sol }}

### compile and deploy
Now we are ready to go and write some tests on our mortal coin contract:
`test/mortalcoin.js`

{{!>mkdir test }}
{{!>ipfs cat QmUPZhvbrbrvCBV6Q1X5nf8dZKLqa5cbDEUJceobqoSrHr|dd  of=test/mortalcoin.js }}

{{> cat test/mortalcoin.js }}

test it:
{{>truffle test }}

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

{{>spore add test/ }}

And **publish** your package:

```
$ spore publish 
```

Congratulation! 
You have successfully created an own currency and enable others to easily replicate your work.
