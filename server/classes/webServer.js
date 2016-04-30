var _webServer = (function () {
    
    var config = require('./config.js');
    var util = require('util');
    var fs = require('fs');
    var path = require('path');
    var http = require('http');
  
    function _toPath(url) {
        return url.split('?')[0];

    }
    function _start(app) {
        
        var mimeTypes = config.appSettings().mimeTypes;
        for (var ext in mimeTypes) {            
            app.get('/*' + ext, function (req, res) {
                var options = {
                    root: global.appRoot,
                    dotfiles: 'deny',
                    headers: {
                        'x-timestamp': Date.now(),
                        'x-sent': true
                    }
                };
                
                res.set('Content-Type',  mimeTypes[req.route.path.replace("/*", "")]);
                res.sendFile(_toPath(req.url), options);
            });

        }
        
        
        app.get('/', function (req, res) {
                var options = {
                    root: global.appRoot,
                    dotfiles: 'deny',
                    headers: {
                        'x-timestamp': Date.now(),
                        'x-sent': true
                    }
                };
                
                //res.set('Content-Type',  mimeTypes[req.route.path.replace("/*", "")]);
                res.sendFile(_toPath("/default.html"), options);
            });
            
            
        
        
      
        var activeport = config.appSettings().port
        if(process.env.PORT !== undefined)
            activeport = process.env.PORT;
        app.listen(activeport, function () {
            
            //config.appSettings().port
           
        });



       
      
        
     


        
    }
    return {
        start: _start
    };
})();
// node.js module export
module.exports = _webServer;