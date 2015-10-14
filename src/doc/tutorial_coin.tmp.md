## Making a custom Coin contract with spore and truffle

<!-- One of the basic features of the blockchain technology was the idea of a decentral value exchange.  -->
<!-- Bitcoin in its basic interpretation represents a currency where a user ballance and can transfear  -->
<!-- it to another user. -->


### Setting up truffle and spore

Here we make a custom Coin contract, test it, and make a package for others to use.
We will do this with truffle, so you will need [truffle](https://github.com/ConsenSys/truffle) and 
spore installed. Install both with:

```
$ npm -g i truffle eth-spore
```

On your first run, spore will guide you trough a setup process. The package naming resolutin is done on the ethereum chain, therefore a connection to an rpc node is needed. If you dont't provide an own rpc node, spore will access the chain trough a central rpc server `spore.memhub.io:8545`, but the use of an own rpc node is highly recomended. The packages and their headers are stored in [ipfs](ipfs.io). Here Spore also provides a default fallback to the standard gateway on `gateway.ipfs.io`. For the full experience, please install ipfs and use it locally. I'll further assume you are running an own rpc node and ipfs under localhost.



<!-- You will also need an rpc Client through wich you'll communicate with the ethereum chain. For development and testing purposes you can stick with a slick rpc client called [testrpc](https://github.com/ConsenSys/eth&#45;testrpc). If you want to do some more serious development, take some time to install and configure the [Ethereum go client](https://github.com/ethereum/go&#45;ethereum).  -->
<!--  -->
<!--  Contracts in ethereum are compiled down to an assembly like language for the EVM (Ethereum Virtual Machine) where the code is executed. Ethereums special feature is that every code execution is timestaped  -->


The ethereum foundation and others have already written coin contracts. Also there is such a thing
as a standard API for coin contracts, so the coin can be openly traded on a decentralized exchange.
To see what other people have already done, we can search Spore for \`Coin\`:

Because Spore is a decentral package manager there is no server, where you can send your search query to. Therefore you'll have to download all package headers to your local machine and search inside them. Depending on the ammount of packages and your ipfs/rpc connection this may take a while.


Lets setup spore and update its database:

{{> spore update }}

Great. Now you have all package headers in your local databse. Lets search for coins:

### Search

{{> spore search coin}}

Awesome, there is already a coin package out there which we will use as a basis for own implementation.

Lets look on the details of this package:

{{> spore info coin }}

### Clone
Now we can clone this package to change it.

{{> spore clone coin }}

this will create a `coin` directory containing all package files. In this tutorial
we will use truffle as our dev-framework, so we need to make a truffle project out of coin:
{{> cd coin }}
{{> truffle init }}
With some cleanup
{{> rm test/example.js }}
{{> rm contracts/Example.sol }}

Truffle uses the information in `config/app.json` on which contract to deploy, so we need to put our coin contract in here:

{{!> sed -i.bak 's/Example/currency/g' config/app.json && rm config/app.json.bak }}

```
  ...
  "deploy": [
    "currency"
  ],
  ...
```

Now we want to extend the coin contract such, that we still have the power to destroy it.
For this, tere is also already a package which allows the creator of an contract to destroy it.

{{> spore info mortal }}

Take a notice here, that a contract which is mortal has also be owned by somebody, 
therefore the package **mortal** is dependend on the package **owned**.

First we have to install this package:

{{> spore install mortal }}

After this, we have to import and assign mortal to our contract `contracts/currency.sol`. The end result has to look like this:

{{!> sed -i.bak 's/contract currency {/import "mortal";\'$'\ncontract currency is mortal {/g' contracts/currency.sol && rm contracts/currency.sol.bak }}

{{> head -5 contracts/currency.sol}}

Take a notice here, that although we imported our mortal contract, its location 
is still somewhere in the `spore_packages` directory. To point the compiler
to the right file, we can simply use the `spore link` command which resolves all
missing imports with the correct ones:

{{> spore link }}

This will leave `contracts/coin.sol` with: 

{{> head -5 contracts/currency.sol }}

### Compile/Deploy
Now we are ready to go and write some tests on our mortal coin contract:
`test/mortalcoin.js`

{{!> ipfs cat QmUPZhvbrbrvCBV6Q1X5nf8dZKLqa5cbDEUJceobqoSrHr|dd  of=test/mortalcoin.js }}

{{> cat test/mortalcoin.js }}

test it:
{{> truffle test }}

and deploy it if you like:

`truffle deploy -e production`

### Publish
If you want to allow others the usage of **mortalcoin** along with your test
you can publish it as a package:
Change the name of the project from coin to mortalcoin in your `spore.json` file.
Include the tests file with:

{{> spore add test/ }}

And publish your package:

` spore publish `

