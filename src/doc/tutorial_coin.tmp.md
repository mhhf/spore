## Making a custom Coin contract with spore and truffle

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

Awesome 

<Found Coin Interface, and SimpleCoin implementation>
<info>

### Clone
<clone coin>

### Install
<install mortal>

### Compile/Deploy
<test>

### Publish
<change readme, package to customcoin>
<publish>

