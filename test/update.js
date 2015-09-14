var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

chai.should();

describe('spore#update', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'a_' );
    scenarios.setup( 'b', 'a_' );
    
    // init a
    init({
      cli: false,
      working_dir: __dirname+'/.scenarios/a_'
    });
    
    var path_to_file = 'readme.md';
    var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    fs.writeFileSync( __dirname+'/.scenarios/a_' + '/' + path_to_file, '# title \n'+rnd );
    
    // add contract
    add({
      cli: false,
      working_dir: __dirname + '/.scenarios/a_',
      path_to_file: 'readme.md'
    });
    
    
    // publish old a_
    var hash = require('../src/lib/publish.es6')( {
      cli: false,
      working_dir: __dirname+'/.scenarios/a_'
    });
    
    
    
    
    
    // INIT B <- old A
    // 
    // init b
    init({
      cli: false,
      working_dir: __dirname+'/.scenarios/b'
    });
    
    
    // install a
    require('../src/lib/install.es6')( {
      working_dir: __dirname+'/.scenarios/b',
      package_name: 'a_'
    });
    
    
    var pkg = require('../src/lib/package.es6')( {
      working_dir: __dirname+'/.scenarios/b'
    });
    
    var oldDep = pkg.json.dependencies['a_'];
    
    
    // randomized new a
    

    var path_to_file = 'readme.md';
    var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    fs.writeFileSync( __dirname+'/.scenarios/a_' + '/' + path_to_file, '# title \n'+rnd );
    
    // add contract
    add({
      cli: false,
      working_dir: __dirname + '/.scenarios/a_',
      path_to_file: 'readme.md'
    });
    
    
    // publish new a
    var hash = require('../src/lib/publish.es6')( {
      cli: false,
      working_dir: __dirname+'/.scenarios/a_'
    });
    
    
    // UPDATE B
    require('../src/lib/update.es6')({
      working_dir: __dirname+'/.scenarios/b'
    });
    
    
    pkg = require('../src/lib/package.es6')( {
      working_dir: __dirname+'/.scenarios/b'
    });
    
    var newDep = pkg.json.dependencies['a_'];
    
  });

  after( function() {
    scenarios.cleanup();
  });
  
  it("should update a simple package", function(done){
    
    require('../src/lib/update.es6')({
      working_dir:__dirname+'/.scenarios/b'
    });
    
    done();
  });
  
  
});

