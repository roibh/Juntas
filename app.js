    var express = require('express');
var cors = require('cors')
//var http = require('http').Server(app);
global.appRoot = __dirname;
global.api_token = "DA113CED-66D3-4BFD-9EE2-873848CE000A";
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
 



var socket = require('socket.io');

var app = express();
http = require('http');
server = http.createServer(app).listen(3002)

 

var io = socket.listen(server)

 



 






//var server = require('./classes/webServer.js');
//server.start(app);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

//var api = require('./classes/api.js');
var user = require('./classes/user.js')(app);
var tabs = require('./classes/tabs.js')(app);

//var ioserver = require('http').createServer(app);
//var io = require('socket.io').listen(ioserver);



global.Rooms = {};
 
 


io.on('connection', function (socket) {
    //socket.emit('news', { hello: 'world' });
    

    socket.on('tab navigate', function (data) {
        if (Rooms[data._id] !== undefined)
            io.to(data._id).emit("tab navigate", data);

    });

    socket.on('tab connect', function (data) {
        console.log(data);
        if (Rooms[data._id] !== undefined)
            socket.join(data._id);
        

    });

    socket.on('tab create', function (data) {
        
        if(Rooms[data._id] === undefined)
            Rooms[data._id] = data;
        socket.room = data._id;
        socket.join(data._id);

        console.log("created room: " + data);
    });

    


});
 
 




 

//api.start(app);


//io.on('connection', function (socket) {
//    socket.on('chat message', function (msg) {
//        console.log('message: ' + msg);
//    });
//});
 

module.exports = app;
