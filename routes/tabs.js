 
    
    
    var util = require('util');
    var fs = require('fs');
    var path = require('path');
    var dal = require('../classes/dal');
    var api = require('../classes/api.js');
    var moment = require('moment');
    
    var ObjectID = require("mongodb").ObjectID;
var express = require('express');
var router = express.Router();
    
    
    
    
router.post('/deletegroup', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        dal.deleteCollection("Tabs", req.body._id  , function (data) {
            
            res.json({ "result": "ok" });

            //if (data.UserId !== req.body.userId) {
            //    data.Followers.splice(data.Followers.indexOf(req.body.userId), 1);
            //    var query = "INSERT INTO Tabs";
            //    dal.query(query, data, function (tab) {
            //        res.json(data);
             
            
            //    });
            //}
             
        
        
        
        })

    });
    
    
router.post('/unsubscribefollowers', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        dal.getSingle("Tabs", req.body._id, function (data) {
            if (data.UserId !== req.body.userId) {
                data.Followers.splice(data.Followers.indexOf(req.body.userId), 1);
                var query = "INSERT INTO Tabs";
                dal.query(query, data, function (tab) {
                    res.json(data);
             
            
                });
            }
             
        
        
        
        })

    });
    
router.post('/fillfollowers', function (req, res) {
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
    
router.get('/tabs', function (req, res) {
        if (!req.query) return res.sendStatus(400);
        
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.getSingle("Tabs", req.query._id , function (tab) {
            res.json(tab);
        });

      

    });
    
router.get('/fillmytab', function (req, res) {
        if (!req.query) return res.sendStatus(400);
        
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.getSingle("Tabs", req.query._id , function (tab) {
            var finalObject = {};
            dal.getSet(tab.Followers, "Users", function (data) {
                
                tab.Followers = {};
                for (var i = 0; i < data.length; i++) {
                    delete data[i].Password;
                    
                    tab.Followers[data[i]._id] = data[i];
                   
                }
                
                var query = "SELECT * FROM Comments WHERE TabId=@TabId";
                dal.query(query, { "TabId": req.query._id }, function (data) {
                
                    tab.Comments = data;
                    res.json(tab);
                });

               
            });
            

             
        });

      

    });
    
    
router.post('/tabsconfiguration', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        
        
        
        var query = "UPDATE Tabs SET Configuration=@Configuration";
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
router.post('/tabs', function (req, res) {
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
    
    
router.post('/followedfeeds', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        
        
        
        var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
        dal.query(query, { "Followers": [req.body.UserId] }, function (items) {
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
    
    
router.post('/feeds', function (req, res) {
        if (!req.body) return res.sendStatus(400);
        
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        
        
        
        var query = "SELECT * FROM Tabs WHERE UserId=@UserId";
        dal.query(query, req.body, function (items) {
            res.json({ items: items });
            
        });

    });
    
    
router.post('/search', function (req, res) {
        var name = req.body.Name;
        dal.connect(function (err, db) {
            
            
            db.collection("Users").find({ $or: [{ "Name": { '$regex': name } }, { "Email": { '$regex': name } }] }).toArray(function (err, arr) {
                
                
                var x = arr;
                var users = arr.map(function (a) {
                    return { "Name": a.Email, "UserId": a._id };
                })
                
                
                db.collection("Tabs").find({
                    $or: [
                        { "Name": { '$regex': name } },
                        { "Description": { '$regex': name } },
                    ], 
                    $and : [{ "Configuration.Discovery": { "$eq": "public" } }]
                }).toArray(function (err, arr) {
                    
                    
                    var x = arr;
                    var tabs = arr.map(function (a) {
                        return { "Name": a.Name, "_id": a._id, "Description": a.Description, "Followers": a.Followers , UserId: a.UserId };
                    })
                    
                    res.status(200).json({ result: { users: users, tabs: tabs } });
                })
                

               

            })
        
        
        })

    });
 
 
    
  

 
// node.js module export
module.exports = router;


