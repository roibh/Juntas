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

var activeport = config.appSettings().port
if (process.env.PORT !== undefined)
    activeport = process.env.PORT;
server = http.createServer(app).listen(activeport);
var io = socket.listen(server);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static('public'));
var juntify = require('./classes/juntify.js'); 
app.use('/juntify', juntify);

var monitor = require('./classes/monitor.js');
app.use('/monitor', monitor);

var user = require('./classes/user.js')(app);
var tabs = require('./classes/tabs.js')(app);
console.log("init complete");
global.Rooms = {};
//io.configure(function () {
//    io.set('transports', ['websocket']);
//    if (process.env.IISNODE_VERSION) {
//        // If this node.js application is hosted in IIS, assume it is hosted 
//        // in IIS virtual directory named 'dante' and set up the socket.io's resource
//        // value for socket.io to recognize requests that target it. 
//        // Note a corresponding change in the client index-socketio.html, as well
//        // as necessary URL rewrite rule in web.config. 

//        io.set('resource', '/socket.io');
//    }
//});


io.on('connection', function (socket) {  

    socket.on('tab navigate', function (data) {
        
        
        
        
        var tabid = data.TabId;
        if (Rooms[tabid] !== undefined) {
            
            var pushObject = { "Date": new Date(), "UserId": data.UserId , "Url": data.Url };
            
            dal.pushObject(tabid, "Tabs", "History" , pushObject, function (data) {
                io.to(tabid).emit("tab navigate", { "TabId": tabid , "Map": pushObject });
               
            });

           
        }
    });
    
    socket.on('tab connect', function (data, userid) {
        console.log(data);
        
        var tabid = data._id;
        socket.join(tabid);
        //if (Rooms[tabid] === undefined) {
            dal.getSingle("Tabs", tabid, function (result) {
                if (result !== null) {
                    if (result.Followers === undefined)
                        result.Followers = [];
                    
                    if (result.Followers.indexOf(userid) == -1) {
                        result.Followers.push(userid)
                        dal.pushObject(tabid, "Tabs", "Followers", userid, function (data) {
                        dal.getSingle("Users", userid, function (data) {
                            delete data.Password;
                            delete data.Token;
                                                  
                                io.to(tabid).emit("tab connected", { "TabId": tabid , "User": data });
                            })
                        
                        })
                }
                else {
                    dal.getSingle("Users", userid, function (data) {
                        if (data.error === undefined)
                         {
                        delete data.Password;
                        delete data.Token;
                            io.to(tabid).emit("tab connected", { "TabId": tabid , "User": data });
                        }
                    })
                }
                    
                    
                    Rooms[tabid] = result;
                    
                }
            })

        //}
        //else {
        //    socket.join(data._id);
        //}
        

    });
    
    socket.on('tab create', function (data) {
        
        if (Rooms[data._id] === undefined)
            Rooms[data._id] = data;
        socket.room = data._id;
        socket.join(data._id);
        
        
        dal.getSingle("Users", data.UserId, function (user) {
            delete user.Password;
            delete user.Token;
            io.to(data._id).emit("tab connected", { "TabId": data._id , "User": user });
        })
        

        console.log("created room: " + data);
    });
    
    socket.on('post message', function (tabid, userid, message) {
        
        
        var pushObject = { "Date": new Date(), "Message": message, "UserId": userid };
        
        dal.pushObject(tabid, "Tabs", "Comments" , pushObject, function (data) {
            console.log(pushObject)
            console.log("to:" + tabid);
            io.to(tabid).emit("commentAdded", { "tabid": tabid , "comment": pushObject });
        });
       
         
    });
    

});


module.exports = app;
