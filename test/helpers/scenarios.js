"use strict"; 

var fs = require('fs-extra');

var scenarios = function(){
  
  var setupAll = function() {
    fs.mkdirSync('./test/.scenarios/');
  }
  
  var setup = function( name, dep ) {
    if( typeof dep === 'string' ) dep = [dep];
    if( typeof dep === 'undefined' ) dep = [];
    let imports = dep
      .map( d => `import "${d}";` )
      .join('\n');
      
    let inheritances = (dep.length>=1?' is ':'') + dep.join(' is ');

    let contract = `${imports}
    
    contract ${name} ${inheritances} {
      
      function ${name} () {
        
      }
      
      function ${name}_ () {
        
      }
      
    }`;

    fs.mkdirsSync(`./test/.scenarios/${name}/contracts`);
    fs.writeFileSync(`./test/.scenarios/${name}/contracts/${name}.sol`, contract);
  }
  
  var cleanup = function() {
    fs.removeSync('./test/.scenarios/');
  }

  return {
    setupAll,
    setup,
    cleanup
  };
}

module.exports = scenarios();
