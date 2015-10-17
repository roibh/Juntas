var express = require('express');
var router = express.Router();
var fs = require('fs');
var util = require('util');

var path = require('path');
var dal = require('../classes/dal');

var moment = require('moment');

var ObjectID = require("mongodb").ObjectID;



/* GET home page. */
router.get('/share', function (req, res) {
    
    var tabid = req.query.j;
    var userid = req.query.u;
    
    var query = "SELECT * FROM Tabs WHERE _id=@_id";
    dal.query(query, { "_id": ObjectID(tabid) }, function (data) {
        if (data.length == 0)
            res.status(404).end();
        else {
            var obj = data[0];
            //ObjectID(tabid)
            dal.connect(function (err, db) {
                db.collection("History").findOne({ $query: { "TabId": tabid }, $orderby: { Date : -1 } }, function (result) {
                    if (result === null)
                        result = { "Url": "http://www.google.com" };

                    var text = fs.readFileSync(global.appRoot + '\\public\\redirect.html', 'utf8');
                    text = text.replace("embedUrl", result.Url);
                    text = text.replace("juntasTabId", tabid);
                    
                    
                    res.send(text);
                
                
                });
            
            });
            
            
            
           
   
             
}
});


});


router.get('/start', function (req, res) {
    
    var tabid = req.query.j;
    var userid = req.query.u;
    
    var query = "SELECT * FROM Tabs WHERE _id=@_id";
    dal.query(query, { "_id": ObjectID(tabid) }, function (data) {
        if (data.length == 0)
            res.status(404).end();
        else {
            var obj = data[0];
            //ObjectID(tabid)
            dal.connect(function (err, db) {
                db.collection("History").findOne({ $query: { "TabId": tabid }, $orderby: { Date : -1 } }, function (result) {
                    if (result === null)
                        result = { "Url": "http://www.google.com" };
                    
                    var text = fs.readFileSync(global.appRoot + '\\public\\start.html', 'utf8');
                    text = text.replace("embedUrl", result.Url);
                    text = text.replace("juntasTabId", tabid);
                    
                    
                    res.send(text);
                
                
                });
            
            });
            
            
            
           
   
             
        }
    });


});


router.get('/end', function (req, res) {
    
    var tabid = req.query.j;
    var userid = req.query.u;
    
    var query = "SELECT * FROM Tabs WHERE _id=@_id";
    dal.query(query, { "_id": ObjectID(tabid) }, function (data) {
        if (data.length == 0)
            res.status(404).end();
        else {
            var obj = data[0];
            //ObjectID(tabid)
            dal.connect(function (err, db) {
                db.collection("History").findOne({ $query: { "TabId": tabid }, $orderby: { Date : -1 } }, function (result) {
                    if (result === null)
                        result = { "Url": "http://www.google.com" };
                    
                    var text = fs.readFileSync(global.appRoot + '\\public\\redirect.html', 'utf8');
                    text = text.replace("embedUrl", result.Url);
                    text = text.replace("juntasTabId", tabid);
                    
                    
                    res.send(text);
                
                
                });
            
            });
            
            
            
           
   
             
        }
    });


});


module.exports = router;