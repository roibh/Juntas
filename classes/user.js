var User = (function (app) {
    
    
    var util = require('util');
    var fs = require('fs');
    var path = require('path');
    var dal = require('./dal.js');
    var api = require('./api.js');
    var moment = require('moment');
    var cors = require('cors');
    app.use(cors());
    
    
    
    app.post('/find', function (req, res) {
        var name = req.body.Name;
        dal.connect(function (err, db) {
            
            
            db.collection("Users").find({ "Email": { '$regex': name } }).toArray(function (err, arr) {
                
                
                var x = arr;
                var users = arr.map(function (a) {
                    return { "Name": a.Email, "UserId": a._id };
                })
                res.status(200).json({ items: users });

            })
        
        
        })

    });
    
    app.post('/feed', function (req, res) {
        var UserId = req.body.UserId;
        dal.connect(function (err, db) {
            
            
            db.collection("Tabs").find({ "UserId": UserId }).toArray(function (err, arr) {
                
                res.status(200).json({ items: arr });

            })
        
        
        })

    });
    
    
    app.post('/login', function (req, res) {
        
        if (!req.body) return res.sendStatus(400);
        
        
        
        //var api_token = req.headers["api_key"];
        //var device_id = req.headers["device_id"];
        
        //if (api_token !== global.api_token) {
        //    res.status(403).json({ "error": { message: "api_token is invalid" } });
        //    return;
        
        //}
        
        //if (device_id === null || device_id === undefined) {
        //    res.status(403).json({ "error": { message: "device_id is missing" } });
        //    return;
        
        //}
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var email = req.body.Email;
        var password = req.body.Password;
        
        
        var query = "SELECT * FROM Users WHERE Email=@Email AND Password=@Password;";
        dal.query(query, { "Email": email, "Password": password }, function (user) {
            
            if (user.length == 0) {
                user = { error: { message: "user not found" } };
                res.status(404).json(user);
                return;
            }
            else {
                ////check deviceid
                //if (user[0].Devices !== undefined && user[0].Devices.indexOf(device_id) == -1 && user[0].Devices.length > 0) {
                //    user = { error: { message: "invalid device" } };
                //    res.status(400).json(user);
                //    return;
                //}
                //else {
                //    user[0].Devices = [];
                //    user[0].Devices.push(device_id);
                //}
                
                var tokenDate = moment(new Date().toUTCString()).utc().format("YYYY-MM-DDTHH:mm.ssZ");
                query = "UPDATE Users SET Token=@Token,TokenDate=@TokenDate WHERE _id=@_id";
                require('crypto').randomBytes(48, function (ex, buf) {
                    var token = buf.toString('hex');
                    dal.query(query, { "TokenDate": tokenDate, "Token": token, "_id": user[0]._id }, function (user) {
                        res.json(user[0]);
                        return;
                    })
                });
            }
            
        });
        
        
    // user.login(email, password,   function (user) { 
    // 
    //        if (user.error !== undefined ) return res.sendStatus(404);
    //        
    //       return res.json(user);
    //     
    //      
    //     });
    
     
 
    });
    
    app.post('/logout', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        //if (api_token !== global.api_token) {
        //    res.status(403).json({ "error": { message: "api_token is invalid" } });
        //    return;
        
        //}
        
        
        
        
        var token = req.body.Token
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
       
        
        var query = "SELECT * FROM Users WHERE Token=@Token";
        dal.query(query, { "Token": token }, function (user) {            
            if (user.length == 0) {                
                user = { error: { message: "not found" } };                
                res.json(user);
            }
            else {
                query = "UPDATE Users SET Token=@Token WHERE _id=@_id";
                dal.query(query, { "Token": null, "_id": user[0]._id }, function (user) {
                    res.json({ "result": "ok" });
                });
            }
            
        });
        
     
 
    });
    
    app.post('/register', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var email = req.body.Email;
        var password = req.body.Password;
        var user = req.body;
        var query = "SELECT * FROM Users WHERE Email=@Email;";
        dal.query(query, { "Email": user.Email }, function (exuser) {
            if (exuser.length == 0) {
                
                
                var query = "INSERT INTO Users Email=@Email,Password=@Password;";
                dal.query(query, { "Email": user.Email , "Password": user.Password }, function (user) {
                    res.json(user.ops[0]);
                    
                
                });
                    
                    

              
            }
            else {
                user = { error: { message: "user exists" } };
                res.json(user);
                 
            }
            
           
            


        });
    
     
 
    });



 
 
    
  

})
// node.js module export
module.exports = User;


