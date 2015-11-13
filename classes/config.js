var _config = (function () {
    
    
    var util = require('util');
    var fs = require('fs');
    var path = require('path');  
 
    var obj = JSON.parse(fs.readFileSync(path.join(global.appRoot, '/config/site.json'), 'utf8').replace(/^\uFEFF/, ''));
    
    //fs.readFile('./config/site.json', 'utf8', function (err, data) {
    //    if (err) throw err;
    //    obj = JSON.parse(data);
    //});   

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