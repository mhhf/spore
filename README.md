[![Stories in Ready](https://badge.waffle.io/mhhf/spore.png?label=ready&title=Ready)](https://waffle.io/mhhf/spore)
[![Build Status](https://travis-ci.org/mhhf/spore.svg)](https://travis-ci.org/mhhf/spore)

For fast development of DApps a package management is needed. Here is a quick and dirty description on how I imagine such a package manager (`spore`) could work. 

### Types

#### API
* abstract classes
* ABI definition
* tests
* deps

#### DApps
* Solidity Code
* tests
* deps

#### Frontend Files
* html
* css
* js
* tests
* deps


I'll use the [MetaCoin-API](https://github.com/ethereum/cpp-ethereum/wiki/MetaCoin-API) as an example. MetaCoin-API provides an interface specification for coins to allow currency services.

#### package info:
```
$ spore info ethereum:metacoin

MetaCoin-API

"balance" <address> 
Returns the current balance of <address>.

"send"
<to-address> <value> Transfers <value> currency units from caller to <to-address>. Returns 1 on success, 0 on failure.

"send" <to-address> <value> <from-address> 
Transfers <value> currency units from <from-address> to <to-address>. In general, there should be additional security requirements (e.g. <from-address> should equal the originating address), or allowing only particular caller/<from-address> combinations through the approval mechanism, denoted below. Returns 1 on success, 0 on failure.

"approve" <address> <enable> 
If <enable> is non-zero, allows <address> to issue send API calls on this interface on behalf of the caller (though send may possibly have additional safeguards in place). If <enable> is zero, resets the state so that <address> cannot issue proxy-sends.

"approved" <address> 
Returns 1 if <address> is approved for issuing proxy sends funded by the caller, 0 otherwise.

```


#### package descovery:
```
$ spore search Coin --dep ethereum:metacoin

  namespace1:Coin - A simple altcoin.
  namespace1:FancyCoin - A complex coin schema.
  namespace2:Coin - ...

$ spore info namespace1:Coin
  └── api:ethereum:metacoin@1.0.0

  Coin is a simple altcoin which gives the contract creator 
  a fixed amount. 

  No additional functions are implemented.

...

$ spore search --dep namespace:Coin

  namespace1:react-bootstrap-coin-ui - Provides simple interaction with Coin Contract.

$ spore info namespace1:react-bootstrap-coin-ui
├── bootstrap@3.0.0
└── namespace1:Coin@1.0.0
```

#### Workflow

```
$ spore add namespace1:react-bootstrap-coin-ui
$ 
```

#### Frontend
Reat Component:
```
import Coin from 'spore/react-bootstrap-coin-ui'

MyClass = React.createClass({
  
  render() {
    return <div> 
      <Coin.Balance />
      <Coin.Sender />
    </div>;
  }

});
```
