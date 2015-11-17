var _config = (function () {
    
    
    var util = require('util');
    var fs = require('fs');
    var path = require('path');  
 
   // var obj = JSON.parse(fs.readFileSync(path.resolve(global.appRoot + '/config/site.json') , 'utf8').replace(/^\uFEFF/, ''));
    
   var obj={
    "name": "testing all node options",
    "url": "",
    "port": "80",
    "appRoot": "/",
    "couchBase": "",
       
   "mongodb": { "host": "mongodb://juntas:juntas$sa@ds049624.mongolab.com:49624/juntas" },
    "mimeTypes": { ".html": "text/html",
        ".css": "text/css",
        ".js": "text/javascript",
        ".less": "text/less",
        ".json": "application/json",
        ".ttf": "application/font-woff",
          ".woff": "application/font-woff"


        


    } 
        
    
}

    var private_variable = 'value';
    function private_function() {
        return obj;
    }
    function appSettings() {
      
        return obj;
    }
    return {
        appSettings: private_function
    };
})();
// node.js module export
module.exports = _config;