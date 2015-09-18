var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');
var PKG         = require('../src/lib/package.es6');

var home = process.env.HOME || process.env.USERPROFILE;
var env = require( home + '/.sporerc.json' );
var CONFIG = require( '../src/lib/config.es6' );
var cfg = CONFIG( env );
var config;

chai.should();

describe('spore#update', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'a_' );
    scenarios.setup( 'b', 'a_' );
    
    var working_dir_a_ = __dirname+'/.scenarios/a_';
    var working_dir_b  = __dirname+'/.scenarios/b';
    
    // init a
    init({
      cli: false,
      working_dir: working_dir_a_
    });
    
    var pkgA = PKG( _.extend({}, cfg, {working_dir: working_dir_a_}) );
    var configA = _.extend( {}, cfg, {pkg:pkgA} );
    
    var path_to_file = 'readme.md';
    var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    fs.writeFileSync( __dirname+'/.scenarios/a_' + '/' + path_to_file, '# title \n'+rnd );
    
    // add contract
    add(_.extend({
      cli: false,
      working_dir: working_dir_a_,
      path_to_file: 'readme.md'
    }, configA));
    
    
    // publish old a_
    var hash = require('../src/lib/publish.es6')( _.extend({
      cli: false,
      working_dir: working_dir_a_
    }, configA));
    
    
    // INIT B <- old A
    // 
    // init b
    init({
      cli: false,
      working_dir: working_dir_b
    });
    
    var pkg = PKG( _.extend({}, cfg, {working_dir: working_dir_b}) );
    config = _.extend( {}, cfg, {pkg} );
    
    
    // install a
    require('../src/lib/install.es6')( _.extend({
      working_dir: working_dir_b,
      package_name: 'a_'
    }, config));
    
    
    var oldDep = config.pkg.json.dependencies['a_'];
    
    // randomized new a
    

    var path_to_file = 'readme.md';
    var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    fs.writeFileSync( working_dir_a_ + '/' + path_to_file, '# title \n'+rnd );
    
    // add contract
    add(_.extend({
      cli: false,
      working_dir: working_dir_a_,
      path_to_file: 'readme.md'
    }, configA));
    
    
    // publish new a
    var hash = require('../src/lib/publish.es6')( _.extend({
      cli: false,
      working_dir: working_dir_a_
    }, configA));
    
    
    // UPDATE B
    require('../src/lib/update.es6')(_.extend({
      working_dir: working_dir_b
    }, config));
    
    
    var newDep = config.pkg.json.dependencies['a_'];
    
  });

  after( function() {
    scenarios.cleanup();
  });
  
  it("should update a simple package", function(done){
    
    require('../src/lib/update.es6')(_.extend({
      working_dir: __dirname+'/.scenarios/b'
    }, config));
    
    done();
  });
  
  
});

