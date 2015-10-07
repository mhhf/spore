#!/bin/sh
truffle deploy
export SPORE_ADDRESS=$(cat config/development/contracts.json|jq '.Spore.address' |sed 's/"//g');
echo $SPORE_ADDRESS
mocha test
