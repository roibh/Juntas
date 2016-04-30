/// <reference path="../../typings/main.d.ts" />
import * as express from "express";
var fs = require('fs');
var util = require('util');
var path = require('path');
var dal = require('../classes/dal');
var moment = require('moment');
var ObjectID = require("mongodb").ObjectID;
var router = express.Router();
class Route {
    public static share(req: express.Request, res: express.Response) {
        var tabid = req.query.j;
        var userid = req.query.u;
        var query = "SELECT * FROM Users WHERE _id=@_id";
        dal.query(query, { "_id": ObjectID(userid) }, function (userdata: any) {
            if (userdata.length > 0)
                userdata = userdata[0];
            var query = "SELECT * FROM Tabs WHERE _id=@_id";
            dal.query(query,
                {
                    "_id": ObjectID(tabid)
                }, function (data: any) {
                    if (data.length == 0)
                        res.status(404).end();
                    else {
                        var obj = data[0];
                        //ObjectID(tabid)
                        dal.connect(function (err: any, db: any) {
                            db.collection("History").findOne({
                                $query: {
                                    "TabId": tabid
                                },
                                $orderby: {
                                    Date: -1
                                }
                            }, function (err: any, result: any) {
                                if (result === null)
                                    result = {
                                        "Url": "http://www.google.com"
                                    };
                                // var text = fs.readFileSync(global.appRoot + '\\public\\redirect.html', 'utf8');
                                // text = text.replace("embedUrl", result.Url);
                                // text = text.replace("juntasTabId", tabid);
                                var modelData = { "embedUrl": result.Url, "juntasTabId": tabid, "tab": obj, "user": userdata };
                                res.render('redirect', modelData);
                                // res.send(text);
                            });
                        });
                    }
                });
        });
    }
    public static entry(req: express.Request, res: express.Response) {
        var modelData = {};
        res.render('entry', modelData);
    };
    public static start(req: express.Request, res: express.Response) {
             var tabid = req.query.j;
        var userid = req.query.u;
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.query(query, {
            "_id": ObjectID(tabid)
        }, function (data: any) {
            if (data.length == 0)
                res.status(404).end();
            else {
                var obj = data[0];
                //ObjectID(tabid)
                dal.connect(function (err: any, db: any) {
                    db.collection("History").findOne({
                        $query: {
                            "TabId": tabid
                        },
                        $orderby: {
                            Date: -1
                        }
                    }, function (err: any, result: any) {
                        if (result === null)
                            result = {
                                "Url": "http://www.google.com"
                            };
                        var modelData = { "embedUrl": result.Url, "juntasTabId": tabid };
                        res.render('start', modelData);
                    });
                });
            }
        });
    }
    public static end(req: express.Request, res: express.Response) {
              var tabid = req.query.j;
        var userid = req.query.u;
        var query = "SELECT * FROM Tabs WHERE _id=@_id";
        dal.query(query, {
            "_id": ObjectID(tabid)
        }, function (data: any) {
            if (data.length == 0)
                res.status(404).end();
            else {
                var obj = data[0];
                //ObjectID(tabid)
                dal.connect(function (err: any, db: any) {
                    db.collection("History").findOne({
                        $query: {
                            "TabId": tabid
                        },
                        $orderby: {
                            Date: -1
                        }
                    }, function (err: any, result: any) {
                        if (result === null)
                            result = {
                                "Url": "http://www.google.com"
                            };
                        var text = fs.readFileSync(global.appRoot + '\\public\\redirect.html', 'utf8');
                        text = text.replace("embedUrl", result.Url);
                        text = text.replace("juntasTabId", tabid);
                        res.send(text);
                    });
                });
            }
        });
    }
}
export function appRoute(app: express.Router) {
    app.route("/juntify/share").get(Route.share);
    app.route("/juntify/entry").get(Route.entry);
    app.route("/juntify/start").get(Route.start);
    app.route("/juntify/end").get(Route.end);
   
}