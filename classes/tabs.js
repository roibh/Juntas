var Tabs = (function (app) {
    
    
    var util = require('util');
    var fs = require('fs');
    var path = require('path');
    var dal = require('./dal.js');
    var api = require('./api.js');
    var moment = require('moment');
    var cors = require('cors');
    var ObjectID = require("mongodb").ObjectID;
    app.use(cors());
    
    
    
    
    
    app.post('/fillfollowers', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        dal.getSingle("Tabs", req.body._id, function (data) { 
            
            dal.getSet(data.Followers, "Users", function (data) {
            
                for (var i = 0; i < data.length; i++) {
                    delete data[i].Password;

                    finalObject[data[i]._id] = data[i];
                   
                }
                res.json(finalObject);
            });
        
        
        
        })

    });
    
    
    
    app.post('/tabs', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        
        
        
        var query = "INSERT INTO Tabs";
        dal.query(query, req.body, function (tab) {
            res.json(tab.ops[0]);
             
            
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
    
    
    app.post('/followedfeeds', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        
        
        
        var query = "SELECT * FROM Tabs WHERE Followers^^@Followers";
        dal.query(query, {"Followers": { "$in": ObjectID(req.body.UserId) }}, function (items) {
            res.json({ items: items });
            

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

    
    app.post('/feeds', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        
        
        
        var query = "SELECT * FROM Tabs WHERE UserId=@UserId";
        dal.query(query, req.body, function (items) {
            res.json({ items: items });
            
        });

    });
    //app.post('/logout', function (req, res) {
    //    if (!req.body) return res.sendStatus(400);
        
    //    if (api_token !== global.api_token) {
    //        res.status(403).json({ "error": { message: "api_token is invalid" } });
    //        return;
             
    //    }
        
        
        
        
    //    var token = req.headers["token"];
    //    api.validateUser(token, "Patients", function (err, PatientId) {
    //        // Convert our form input into JSON ready to store in Couchbase
    //        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
    //        //var PatientId = req.body.PatientId;
            
    //        var query = "SELECT * FROM Patients WHERE _id=@_id";
    //        dal.query(query, { "_id": PatientId }, function (user) {
                
    //            if (user.length == 0) {
                    
    //                user = { error: { message: "not found" } };
                    
    //                res.json(user);
    //            }
    //            else {
    //                query = "UPDATE Patients SET Token=@Token WHERE _id=@_id";
    //                dal.query(query, { "Token": null, "_id": user[0]._id }, function (user) {
    //                    res.json({ "result": "ok" });
    //                });
    //            }
    //        });
   
    //    });
     
 
    //});
    
    //app.post('/register', function (req, res) {
    //    if (!req.body) return res.sendStatus(400);
        
    //    // Convert our form input into JSON ready to store in Couchbase
    //    var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
    //    var email = req.body.Email;
    //    var password = req.body.Password;
    //    var user = req.body;
    //    var query = "SELECT * FROM Users WHERE Email=@Email;";
    //    dal.query(query, { "Email": user.Email }, function (exuser) {
    //        if (exuser.length == 0) {
                
                
    //            var query = "INSERT INTO Users Email=@Email,Password=@Password;";
    //            dal.query(query, { "Email": user.Email , "Password": user.Password }, function (user) {
    //                res.json(user.ops[0]);
                    
                
    //            });
                    
                    

              
    //        }
    //        else {
    //            user = { error: { message: "user exists" } };
    //            res.json(user);
                 
    //        }
            
           
            


    //    });
    
     
 
    //});



 
 
    
  

})
// node.js module export
module.exports = Tabs;


