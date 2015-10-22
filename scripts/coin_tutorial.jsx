require('shelljs/global');
var _ = require('underscore');
var fs = require('fs');
require('colors');

// Set template to Mustache
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// TODO - remove database
// TODO - refactor template indocator from mustashe to default markdown ```bash...```
// 

// run testrpc
var testrpc = exec('testrpc', {silemt:true, async:true});

var c = function( str ) {
  return "```\n"+str+"\n```";
}

var e = function( str, silent ) {
  var res = exec(str, {silent: true}).output;
  res = res
  .replace(/\u0000/g,'') // Remove all blakn chars
  .replace(/\x1b\[\d\d?m/g,''); // Remove all colored outputs
  
  console.log('----------');
  console.log('>', str);
  console.log(res);
  console.log('----------');
  
  if(silent) return '';
  
return `\`\`\`bash
$ ${str}
${res}
\`\`\``;
}

var wd = pwd();

var raw_tmp = fs.readFileSync('src/doc/tutorial_coin.tmp.md', 'utf8');

// clean local spore setup
rm('db.json');
rm('~/.sporerc');
/// co to neutral directory 
mkdir ("tmp");
cd ("tmp");


var processed_tmp = raw_tmp.replace(/\{\{([^}]*)\}\}/g, function( find, exec ){

  var silent = false;
  if( (/^\>/).test(exec) ) {
    exec = exec.slice(1);
  } else if( (/^\!\>/).test(exec) ) {
    exec = exec.slice(2);
    silent = true;
  } else {
    console.log('ERR'.red + " ", exec);
  }

  if(exec === ' cd coin ') {
    cd('coin'); 
    return '\n```\n$ cd coin\n```\n'
  }
  return e(exec, silent);
});

// console.log("\n\n\n\n");
// console.log("\n\n\n\n");
// console.log("\n\n\n\n");
// console.log(processed_tmp)
// console.log("\n\n\n\n");
// console.log("\n\n\n\n");
// console.log("\n\n\n\n");

var tmp     = _.template( processed_tmp );

var doc = tmp({ e });

cd ( wd );

// Save Tutorial
fs.writeFileSync('doc/tutorial_coin.md', doc);

rm ('-fR','tmp');
