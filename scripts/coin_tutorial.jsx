require('shelljs/global');
var _ = require('underscore');
var fs = require('fs');

// Set template to Mustache
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

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

var wd = pwd();

var raw_tmp = fs.readFileSync('src/doc/tutorial_coin.tmp.md', 'utf8');

// clean local spore setup
rm('db.json');
rm('.spore.json');
/// co to neutral directory 
mkdir ("tmp");
cd ("tmp");


var processed_tmp = raw_tmp.replace(/\{\{\>([^}]*)\}\}/g, function( find, exec ){
  return e(exec);
});

var tmp     = _.template( processed_tmp );

var doc = tmp({ e });

cd ( wd );

// Save Tutorial
fs.writeFileSync('doc/tutorial_coin.md', doc);

rm ('-fdR','tmp');


