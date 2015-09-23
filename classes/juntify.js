var express = require('express');
var router = express.Router();
var fs = require('fs');
var util = require('util');

var path = require('path');
var dal = require('./dal');

var moment = require('moment');

var ObjectID = require("mongodb").ObjectID;



/* GET home page. */
router.get('/*', function (req, res) {
    
    var tabid = req.query.j;
    var userid = req.query.u;
    
    var query = "SELECT * FROM Tabs WHERE _id=@_id";
    dal.query(query, { "_id": ObjectID(tabid) }, function (data) {
        if (data.length == 0)
            res.status(404);
        else {
            var obj = data[0];
            
            var lastPage = obj.History[obj.History.length - 1];
            
            var text = fs.readFileSync(global.appRoot + '\\public\\redirect.html', 'utf8');
            text = text.replace("embedUrl", lastPage.Url);
            text = text.replace("juntasTabId", tabid);
            

            res.send(text);
             
        }
    });
  

});

module.exports = router;