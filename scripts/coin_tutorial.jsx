require('shelljs/global');

// TODO - remove database

var c = function( str ) {
  return "```\n"+str+"\n```";
}

var e = function( str ) {
  var res = exec(str).output;
return `\`\`\`
$ ${str}
${res}
\`\`\``;
}

/// Setup
mkdir ("tmp");
cd ("tmp");

var string = `Here we make a custom Coin contract, test it, and make a package for others to use.
We will do this in truffle, so you will need [truffle](https://github.com/ConsenSys/truffle) and 
spore installed. After you have installed both we can begin!

The ethereum foundation and others have already written coin contracts. Also there is such a thing
as a standard interface, so the coin can be openly traded on a decentralized exchange.
To see what other people have already done, we can search Spore fore \`Coin\`:
First we update the package database:
${e("spore update")}
${e("spore search Coin")}


Awesome 
<Found Coin Interface, and SimpleCoin implementation>
<clone simplecoin>
<test simplecoin>
<change readme, package to customcoin>
<deploy>
<publish>
`;

mkdir( 'customcoin' );
console.log(string);

