/// <reference path="../../typings/main.d.ts" />
import * as express from "express";


var util = require('util');
var fs = require('fs');
var path = require('path');
var dal = require('../classes/dal');
var api = require('../classes/api.js');
var moment = require('moment');
var verifier = require('../classes/verifier.js');
var ObjectID = require("mongodb").ObjectID;
var thumbler = require('../classes/thumbler.js');
 
 
class Route {

    public static deletegroup(req: express.Request, res: express.Response) {
    
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        dal.deleteCollection("Tabs", req.body._id, function (data: any) {
            res.json({ "result": "ok" });
            //if (data.UserId !== req.body.userId) {
            //    data.Followers.splice(data.Followers.indexOf(req.body.userId), 1);
            //    var query = "INSERT INTO Tabs";
            //    dal.query(query, data, function (tab) {
            //        res.json(data);
            //    });
            //}
        })
    };

    public static unsubscribefollowers(req: express.Request, res: express.Response) {
    
        if (!req.body) return res.sendStatus(400);
        var finalObject = {};
        dal.getSingle("Tabs", req.body._id, function (data: any) {
            if (data.UserId !== req.body.userId) {
                data.Followers.splice(data.Followers.indexOf(req.body.userId), 1);
                var query = "INSERT INTO Tabs";
                dal.query(query, data, function (tab: any) {
                    res.json(data);
                });
            }
        })
    } 

    public static fillfollowers(req: express.Request, res: express.Response) {

    
        if (!req.body) return res.sendStatus(400);
        var finalObject: any = {};
        dal.getSingle("Tabs", req.body._id, function (data: any) {
            dal.getSet(data.Followers, "Users", function (data: any) {
                for (var i = 0; i < data.length; i++) {
                    delete data[i].Password;
                    finalObject[data[i]._id] = data[i];
                }
                res.json(finalObject);
            });
        })
    } 

    public static tabs(req: express.Request, res: express.Response) {
   
        if (!req.query) return res.sendStatus(400);
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.getSingle("Tabs", req.query._id, function (tab: any) {
            res.json(tab);
        });
    } 

    public static fillmytab(req: express.Request, res: express.Response) {
    
        if (!req.query) return res.sendStatus(400);
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        var tabid = req.query._id;
        dal.getSingle("Tabs", req.query._id, function (tab: any) {
            var finalObject = {};
            dal.getSet(tab.Followers, "Users", function (data: any) {
                tab.Followers = {};
                for (var i = 0; i < data.length; i++) {
                    delete data[i].Password;
                    tab.Followers[data[i]._id] = data[i];
                    if (global.Rooms[tabid] && global.Rooms[tabid].online)
                        tab.Followers[data[i]._id].online = global.Rooms[tabid].online[data[i]._id];
                }
                dal.connect(function (err: any, db: any) {
                    db.collection("Comments").find({ $query: { "TabId": req.query._id }, $orderby: { Date: -1 } }).limit(10).toArray(function (err: any, data: any) {
                        tab.Comments = data;
                        db.collection("History").find({ $query: { "TabId": req.query._id }, $orderby: { Date: -1 } }).limit(10).toArray(function (err: any, data: any) {
                            tab.History = data;
                            var hashArr: any = [];
                            var tabDictionary: any = {};
                            for (var i = 0; i < tab.History.length; i++) {
                                var hash = verifier.url2filename(tab.History[i].Url);
                                hashArr.push(hash);
                                tabDictionary[hash] = tab.History[i];
                            }
                            db.collection("Metadata").find({ $query: { "hash": { $in: hashArr } } }, { title: 1, hash: 1, description: 1, Likes: { $elemMatch: { TabId: req.query._id } } }).toArray(function (err: any, metadata: any) {
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
    } 


    public static tabsconfiguration(req: express.Request, res: express.Response) {
    
        if (!req.body) return res.sendStatus(400);
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var query = "UPDATE Tabs SET Configuration=@Configuration";
        dal.query(query, req.body, function (tab: any) {
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
    } 

    public static newtab(req: express.Request, res: express.Response) {
     
        if (!req.body) return res.sendStatus(400);
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var obj = req.body;

        if (obj._id) {
            var query = "UPDATE Tabs SET Configuration=@Configuration WHERE _id=@_id";
            var ObjectID = require("mongodb").ObjectID;
            dal.query(query, { "_id": ObjectID(obj._id), "Configuration": obj.Configuration }, function (tab: any) {
                res.json({});


            });
            return;

        }

        var comment = obj.Comments[0];
        var history = obj.History[0];
        delete obj.Comments;
        delete obj.History;
        var query = "INSERT INTO Tabs";
        dal.query(query, req.body, function (tab: any) {
            comment.TabId = tab.ops[0]._id.toString();
            history.TabId = tab.ops[0]._id.toString();
            var query = "INSERT INTO Comments";
            dal.query(query, comment, function (tab: any) {
            });
            if (tab.Url !== undefined) {
                var actionGuid = thumbler.url2filename(tab.Url);
                thumbler.capture(tab.Url, actionGuid);
                var filepathbase = moment().format("MM_YYYY") + "/" + actionGuid + ".png";
                history.Thumb = filepathbase;
                //var pushObject = { "Date": new Date(), "UserId": data.UserId , "Url": data.Url, "Thumb": filepathbase, "TabId": tabid };
                tab.ops[0].History = [history];
                var query = "INSERT INTO History";
                dal.query(query, history, function (tab: any) {
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
    } 


    public static followedfeeds(req: express.Request, res: express.Response) {
    
        if (!req.body) return res.sendStatus(400);
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
        dal.query(query, { "Followers": [req.query.UserId] }, function (items: any) {
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
    } 


    public static feeds(req: express.Request, res: express.Response) {
     
        if (!req.body) return res.sendStatus(400);
        // Convert our form input into JSON ready to store in Couchbase
        var jsonVersion = "{}";//returnJSONResults("", "");//JSON.stringify(req.body);
        var query = "SELECT * FROM Tabs WHERE UserId=@UserId";
        dal.query(query, req.body, function (items: any) {
            res.json({ items: items });
        });
    } 



    public static search(req: express.Request, res: express.Response) {
     
        var name = req.body.Name;
        dal.connect(function (err: any, db: any) {
            var term = new RegExp(".*" + name + ".*", 'i');
            db.collection("Users").find({ $or: [{ "Name": { '$regex': term } }, { "Email": { '$regex': term } }] }).toArray(function (err: any, arr: any) {
                var x = arr;
                var users = arr.map(function (a: any) {
                    return { "Name": a.Email, "UserId": a._id };
                })
                db.collection("Tabs").find({
                    $or: [
                        { "Name": { '$regex': term } },
                        { "Description": { '$regex': term } },
                    ],
                    $and: [{ "Configuration.Discovery": { "$eq": "public" } }]
                }).toArray(function (err: any, arr: any) {
                    var x = arr;
                    var tabs = arr.map(function (a: any) {
                        return { "Name": a.Name, "_id": a._id, "Description": a.Description, "Followers": a.Followers, UserId: a.UserId };
                    })
                    res.status(200).json({ result: { users: users, tabs: tabs } });
                })
            })
        })


    } 
}



export function appRoute(app: express.Router) {
    app.route("/tabs/deletegroup").post(Route.deletegroup);
    app.route("/tabs/unsubscribefollowers").post(Route.unsubscribefollowers);
    app.route("/tabs/fillfollowers").post(Route.fillfollowers);

    app.route("/tabs/tabs").get(Route.tabs).post(Route.newtab);

     
    app.route("/tabs/fillmytab").get(Route.fillmytab);
     


   

    app.route("/tabs/followedfeeds").get(Route.followedfeeds);
    app.route("/tabs/feeds").post(Route.feeds);
    app.route("/tabs/search").post(Route.search);



}
