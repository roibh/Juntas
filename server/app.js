"use strict";
global.appRoot = __dirname;
global.api_token = "DA113CED-66D3-4BFD-9EE2-873848CE000A";
var express = require("express");
var routes = require('./routes/index');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require('url');
var querystring = require('querystring');
var dal = require('./classes/dal.js');
var config = require('./classes/config.js');
var moment = require('moment');
var SocketUse = require('./classes/socket.js');
var http = require('http');
var app = express();
var activeport = config.appSettings().port;
if (process.env.PORT !== undefined)
    activeport = process.env.PORT;
var server = http.createServer(app).listen(activeport);
var socket = require('socket.io');
var io = socket.listen(server);
SocketUse(io);
var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
app.use(bodyParser.json({
    reviver: function (key, value) {
        var match;
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
            var milliseconds = Date.parse(match[0]);
            if (!isNaN(milliseconds)) {
                return new Date(milliseconds);
            }
        }
        return value;
    },
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
routes(app);
console.log("\n");
console.log("_______________________________________________________________________________");
console.log("|.............................................................................|");
console.log("|.............................................................................|");
console.log("|.............................................................................|");
console.log("|.............................                  ..............................|");
console.log("|............................. juntas is online ..............................|");
console.log("|.............................                  ..............................|");
console.log("|.............................................................................|");
console.log("|.............................................................................|");
console.log("|_____________________________________________________________________________|");
global.Rooms = {};
module.exports = app;
