var util = require('util');
var fs = require('fs');
var path = require('path');
var dal = require('../classes/dal');
var api = require('../classes/api.js');
var moment = require('moment');
var verifier = require('../classes/verifier.js');
var ObjectID = require("mongodb").ObjectID;
var thumbler = require('../classes/thumbler.js');
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
            
            
            dal.connect(function (err, db) {
                
                db.collection("Comments").find({ $query: { "TabId": req.query._id }, $orderby: { Date : -1 } }).limit(10).toArray(function (err, data) {
                    tab.Comments = data;
                    db.collection("History").find({ $query: { "TabId": req.query._id }, $orderby: { Date : -1 } }).limit(10).toArray(function (err, data) {
                        tab.History = data;
                        var hashArr = [];
                        var tabDictionary = {};
                        for (var i = 0; i < tab.History.length; i++) { 
                            var hash = verifier.url2filename(tab.History[i].Url);
                            hashArr.push(hash);
                            tabDictionary[hash] = tab.History[i];
                        }
                       

                        db.collection("Metadata").find({$query : { "hash": { $in: hashArr } } }, { title: 1, hash: 1, description: 1, Likes: { $elemMatch: { TabId: req.query._id } } }).toArray(function (err, metadata) {
                            for (var i = 0; i < metadata.length; i++) {
                                tabDictionary[metadata[i].hash].Likes = metadata[i].Likes;
                            }
                            tab.History = [];
                            for (var hash in tabDictionary) {
                                tab.History.push(tabDictionary[hash]);
                            }

                            res.json(tab);
                        
                        });
       
                        
                    });
                });
            
            })
                 

               
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
    
    
    
    var obj = req.body;
    var comment = obj.Comments[0];
    var history = obj.History[0];
    delete obj.Comments;
    delete obj.History;
    
    var query = "INSERT INTO Tabs";
    dal.query(query, req.body, function (tab) {
        
        
        comment.TabId = tab.ops[0]._id.toString();
        history.TabId = tab.ops[0]._id.toString();
        
        var query = "INSERT INTO Comments";
        dal.query(query, comment, function (tab) {           
        });
        if (tab.Url !== undefined) {
            var actionGuid = thumbler.url2filename(tab.Url);
            thumbler.capture(data, actionGuid);
            var filepathbase = moment().format("MM_YYYY") + "/" + actionGuid + ".png";
            history.Thumb = filepathbase;
            //var pushObject = { "Date": new Date(), "UserId": data.UserId , "Url": data.Url, "Thumb": filepathbase, "TabId": tabid };
            
            tab.ops[0].History = [history];
            var query = "INSERT INTO History";
            dal.query(query, history, function (tab) {
            });
            
        }
        
        tab.ops[0].Comments = [comment];
        
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
router.get('/followedfeeds', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    
    // Convert our form input into JSON ready to store in Couchbase
    var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
    
    
    
    var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
    dal.query(query, { "Followers": [req.query.UserId] }, function (items) {
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
module.exports = router;


