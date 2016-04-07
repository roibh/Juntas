var express = require('express');
var router = express.Router();
var fs = require('fs');
var util = require('util');

var path = require('path');
var dal = require('../classes/dal');

var moment = require('moment');

var ObjectID = require("mongodb").ObjectID;



/* GET home page. */
router.get('/rooms', function (req, res) {
    
    res.json(global.Rooms);
  

});

/* GET home page. */
router.get('/room/', function (req, res) {
    
    
    if( global.Rooms[req.query.tabid])
    {
    var room = global.Rooms[req.query.tabid].online;
    return  res.json(room);
      
    }
    
    res.json({});
    

});


module.exports = router;