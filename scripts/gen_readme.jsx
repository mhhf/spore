var _ = require('underscore');
var fs = require('fs');

// Set template to Mustache
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// Load version numbers
var __package                 = JSON.parse( fs.readFileSync( 'package.json', 'utf8' ) );
var spore_v                   = __package.version;
var cli_v                     = __package.spore.cli_version;
var client_v                  = __package.spore.client_version;
var ipfs_v                    = __package.spore.ipfs_version;

// Load Readme template
var raw_tmp                   = fs.readFileSync('src/doc/README.tmp.md', 'utf8');
var tmp                       = _.template( raw_tmp );

// Configure template options
// | Load cli spec
var cli                       = fs.readFileSync(`src/specs/cli_${cli_v}.docopt`, 'utf8');
// | Load spore pkg json
var spore_json                = fs.readFileSync('spore.json', 'utf8');
// | Load API doc
// TODO - remove?
var api_doc                   = fs.readFileSync('doc/api.md','utf8');


// Create template object
var obj                       = { cli, spore_json, api_doc };

// Generate readme text
var readme                    = tmp( obj );

// Save Readme
fs.writeFileSync('README.md', readme);

