var express = require('express');
var router = express.Router();
var fs = require('fs');
var util = require('util');

var path = require('path');
var dal = require('../classes/dal');

var moment = require('moment');

var ObjectID = require("mongodb").ObjectID;



/* GET home page. */
router.get('/*', function (req, res) {
    
    res.json(global.Rooms);
  

});

module.exports = router;