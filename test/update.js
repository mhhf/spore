var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');

var home = process.env.HOME || process.env.USERPROFILE;
var config = require( home + '/.sporerc.json' );

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
    add(_.extend({
      cli: false,
      working_dir: __dirname + '/.scenarios/a_',
      path_to_file: 'readme.md'
    }, config));
    
    
    // publish old a_
    var hash = require('../src/lib/publish.es6')( _.extend({
      cli: false,
      working_dir: __dirname+'/.scenarios/a_'
    }, config));
    
    
    // INIT B <- old A
    // 
    // init b
    init({
      cli: false,
      working_dir: __dirname+'/.scenarios/b'
    });
    
    
    // install a
    require('../src/lib/install.es6')( _.extend({
      working_dir: __dirname+'/.scenarios/b',
      package_name: 'a_'
    }, config));
    
    
    var pkg = require('../src/lib/package.es6')(_.extend({
      working_dir: __dirname+'/.scenarios/b'
    }, config));
    
    var oldDep = pkg.json.dependencies['a_'];
    
    // randomized new a
    

    var path_to_file = 'readme.md';
    var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    fs.writeFileSync( __dirname+'/.scenarios/a_' + '/' + path_to_file, '# title \n'+rnd );
    
    // add contract
    add(_.extend({
      cli: false,
      working_dir: __dirname + '/.scenarios/a_',
      path_to_file: 'readme.md'
    }, config));
    
    
    // publish new a
    var hash = require('../src/lib/publish.es6')( _.extend({
      cli: false,
      working_dir: __dirname+'/.scenarios/a_'
    }, config));
    
    
    // UPDATE B
    require('../src/lib/update.es6')(_.extend({
      working_dir: __dirname+'/.scenarios/b'
    }, config));
    
    
    pkg = require('../src/lib/package.es6')( _.extend({
      working_dir: __dirname+'/.scenarios/b'
    }, config));
    
    var newDep = pkg.json.dependencies['a_'];
    
  });

  after( function() {
    scenarios.cleanup();
  });
  
  it("should update a simple package", function(done){
    
    require('../src/lib/update.es6')(_.extend({
      working_dir:__dirname+'/.scenarios/b'
    }, config));
    
    done();
  });
  
  
});

