# Architecture 

## Ethereum
Ethereum handles the routing resolution:
it provides functionality to register/ update a package and resolve it's ipfs hash and owner.

## IPFS Package
### HEADER
is a json with following spec:
```
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "name"
    },
    "description": {
      "type": "string",
      "title": "Description",
      "maxLength": 80
    },
    "version": {
      "type": "string",
      "title": "Version"
    },
    "dependencies": {
      "type": "object"
    },
    "contracts": {
      "type": "object"
    },
    "root": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```
