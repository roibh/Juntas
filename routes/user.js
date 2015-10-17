


var util = require('util');
var fs = require('fs');
var path = require('path');
var dal = require('../classes/dal.js');
var api = require('../classes/api.js');
var moment = require('moment');
var express = require('express');
var router = express.Router();




router.post('/feed', function (req, res) {
    var UserId = req.body.UserId;
    dal.connect(function (err, db) {
        
        
        db.collection("Tabs").find({ "UserId": UserId }).toArray(function (err, arr) {
            
            res.status(200).json({ items: arr });

        })
        
        
    })

});

router.post("/oauth", function (req, res) {
    
    if (!req.body) return res.sendStatus(400);
    
    var query = "SELECT * FROM Users WHERE Uid=@Uid;";
    dal.query(query, { "Uid": req.body.Uid }, function (user) {
        if (user.length == 0) {
            user = {
                "FirstName": req.body.FirstName,
                "LastName": req.body.LastName,
                "Picture": req.body.Picture,
                "Email": req.body.Email,
                "Token": req.body.Token,
                "Uid" : req.body.Uid
            }
            var query = "INSERT INTO Users";
            dal.query(query, user, function (user) {
                mapRooms(user.ops[0]);
                res.json(user.ops[0]);
                    

            });
                
        } else {
            
            var query = "UPDATE Users SET FirstName=@FirstName,LastName=@LastName,Picture=@Picture,Email=@Email,Token=@Token,Uid=@Uid WHERE Uid=@Uid;";
            dal.query(query, {                
                "FirstName": req.body.FirstName,
                "LastName": req.body.LastName,
                "Picture": req.body.Picture,
                "Email": req.body.Email,
                "Token": req.body.Token,
                "Uid" : req.body.Uid
            }, function (result) {
                res.json(result[0]);
            });
        }
        
        
    });
    
    
    
});

router.post("/facebook", function (req, res) {
    
    if (!req.body) return res.sendStatus(400);
    
    var query = "SELECT * FROM Users WHERE Uid=@Uid;";
    dal.query(query, { "Uid": req.body.Uid }, function (users) {
        if (users.length == 0) {
            user = {
                "FirstName": req.body.FirstName,
                "LastName": req.body.LastName,
                "Picture": req.body.Picture,
                "Email": req.body.Email,
                "Token": req.body.Token,
                "Uid" : req.body.Uid
            }
            var query = "INSERT INTO Users;";
            dal.query(query, user, function (user) {
                res.json(user.ops[0]);
            });
                
        } else {
            
            var user = users[0];
            var query = "UPDATE Users SET FirstName=@FirstName,LastName=@LastName,Picture=@Picture,Email=@Email,Token=@Token,Uid=@Uid WHERE _id=@_id;";
            dal.query(query, {
                "_id": user._id,
                "FirstName": req.body.FirstName,
                "LastName": req.body.LastName,
                "Picture": req.body.Picture,
                "Email": req.body.Email,
                "Token": req.body.Token,
                "Uid" : req.body.Uid
            }, function (result) {
                res.json(result[0]);
            });
            

                
        }
        
        
    });
    
    
    
});



router.post('/login', function (req, res) {
    
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
            res.json(user);
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

router.post('/logout', function (req, res) {
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

router.post('/register', function (req, res) {
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




function mapRooms(user) {
    var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
    dal.query(query, { "Followers": [user._id] }, function (items) {
        for (var i = 0; i < items.length; i++) {
            if (global.Rooms[items[i]._id] === undefined) {
                global.Rooms[items[i]._id] = items[i]
            }
        }
    });
}




// node.js module export
module.exports = router;


