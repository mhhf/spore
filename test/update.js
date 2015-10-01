var mocha       = require('mocha');
var chai        = require('chai');
var should      = require('should');
var fs          = require('fs-extra');
var _           = require('underscore');

var add         = require('../src/lib/add.es6')
var init        = require('../src/lib/init.es6');
var scenarios   = require('./helpers/scenarios.js');
var PKG         = require('../src/lib/package.es6');

var CONFIG      = require('../src/lib/config.es6');


var working_dir_a_ = __dirname+'/.scenarios/a_';
var working_dir_b  = __dirname+'/.scenarios/b';

var configA = CONFIG({working_dir: working_dir_a_}, {cli: false});
var configB = CONFIG({working_dir: working_dir_b}, {cli: false});
configA.initAll();
configB.initAll();


chai.should();

describe('spore#upgrade', function() {
  
  before( function() {
    scenarios.setupAll();
    scenarios.setup( 'a_' );
    scenarios.setup( 'b', 'a_' );
    
    
    // init a
    init( configA );
    configA.initPkg();
    
    
    var path_to_file = configA.path_to_file = 'readme.md';
    var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    fs.writeFileSync( __dirname+'/.scenarios/a_' + '/' + path_to_file, '# title \n'+rnd );
    

    
    // add contract
    add( configA );
    
    
    // publish old a_
    var hash = require('../src/lib/publish.es6')( configA );
    
    
    // INIT B <- old A
    // 
    // init b
    init( configB );
    configB.initPkg();
    
    
    configB.package_name = 'a_';
    // install a
    require('../src/lib/install.es6')( configB );
    
    
    var oldDep = configB.pkg.json.dependencies['a_'];
    
    // randomized new a
    var path_to_file = configA.path_to_file = 'readme.md';
    var rnd = Math.floor(Math.random()*Math.pow(16,8)).toString(16);
    fs.writeFileSync( working_dir_a_ + '/' + path_to_file, '# title \n'+rnd );
    
    // add contract
    add( configA );
    
    
    // publish new a
    var hash = require('../src/lib/publish.es6')( configA );
    
    
    // UPDATE B
    require('../src/lib/upgrade.es6')( configB );
    
    
    var newDep = configB.pkg.json.dependencies['a_'];
    
  });

  after( function() {
    scenarios.cleanup();
  });
  
  it("should upgrade a simple package", function(done){
    
    require('../src/lib/upgrade.es6')( configB );
    
    done();
  });
  
  
});

