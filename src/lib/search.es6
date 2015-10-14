var fs = require('fs-extra');
var _  = require('underscore');
var moment = require('moment');

module.exports = function( config ) {
  
  
  var str = config['<string>'];
  
  // TODO - migrate to reasonable db model and search engine
  // maybe leveldb and norch
  // 
  var npm_location = process.env.SPORE_NPM_LOCATION;
  if( fs.existsSync( npm_location + '/db.json' ) ) {
    var db = JSON.parse(fs.readFileSync( npm_location + 'db.json' ));
    console.log(`last update was ${moment(db.updated).fromNow()}`);
    
    var res = {};
    _.each(db.pkgs, function( obj, hash ) {
      if( 
         obj.name.indexOf(str) > -1 
           || obj.header.description.indexOf(str)> -1
           || obj.header.tags.indexOf(str) > -1
        ) {
          res[ obj.name ] = {
            desc: obj.header.description
          };
      }
    });
    
    if(Object.keys(res).length > 0) {
      console.log(`Found ${Object.keys(res).length} results for search ${str}: \n`);
      _.each(res, ( obj, name ) => {
        console.log(`  ${name}: ${obj.desc}`.replace(new RegExp(str,'g'),'\x1b[01m'+str+'\x1b[0m','g'));
          
      });
    } else {
      console.log(`No package found for search "${str}"`);
    }
    
  } else {
    console.log(`No Packages in the database. Update the database with 'spore update'.`)
  }
  
}
