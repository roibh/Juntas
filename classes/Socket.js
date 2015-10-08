var socketuse = function (io) {
    
    
    var express = require('express');
    var router = express.Router();
    var fs = require('fs');
    var util = require('util');
    
    var path = require('path');
    var dal = require('./dal');
    
    var moment = require('moment');
    
    var ObjectID = require("mongodb").ObjectID;
    
    
    
    io.on('connection', function (socket) {
        
        
        socket.on('juntas connect', function (data) {
            
            
            
            var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
            dal.query(query, { "Followers": [data.UserId] }, function (items) {
                for (var i = 0; i < items.length; i++) {
                    var tid = items[i]._id.toString();
                    if (socket.rooms.indexOf(tid) === -1)
                        socket.join(tid);
                    
                    if (global.Rooms[tid] === undefined) {
                        global.Rooms[tid] = items[i]
                    }
                }
            });
            
            
            var tabid = data.TabId;
            if (global.Rooms[tabid] !== undefined) {
                
                var pushObject = { "Date": new Date(), "UserId": data.UserId , "Url": data.Url };
                
                dal.pushObject(tabid, "Tabs", "History" , pushObject, function (data) {
                    io.to(tabid).emit("tab navigate", { "TabId": tabid , "Map": pushObject });
               
                });

           
            }
        });
        
        socket.on('tab navigate', function (data) {
            var tabid = data.TabId;
            if (global.Rooms[tabid] !== undefined) {
                var actionGuid = url2filename(data.Url);
                
                
                
                
                
                
                
                var filepathbase = moment().format("MM_YYYY") + "/" + actionGuid + ".png";
                
                var filepathfolder = "public/url_images/" + filepathbase;
                var filepathfolderdisc = global.appRoot + "\\public\\url_images\\" + moment().format("MM_YYYY") + "\\" + actionGuid + ".png";
                var filepathfoldertemp = "public/url_images/" + moment().format("MM_YYYY") + "/temp" + actionGuid + ".png";
                var filepathfolderdisctemp = global.appRoot + "\\public\\url_images\\" + moment().format("MM_YYYY") + "\\temp" + actionGuid + ".png";
                if (!fs.existsSync(filepathfolderdisc)) {
                    fs.createReadStream(path.resolve(global.appRoot, 'public/images/temp.png')).pipe(fs.createWriteStream(filepathfolder));
                    
                    var options = {
                        renderDelay: 1000,
                        screenSize: {
                            width: 400
                            , height: 300
                        }
                        , shotSize: {
                            width: 400
                            , height: 300
                        }, zoomFactor: 0.50,
                        userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
                    }
                    
                    webshot(data.Url, filepathfoldertemp, options, function (err) {
                        
                        
                        
                        var resizeCrop = require('resize-crop');
                        
                        resizeCrop(
                            {
                                format: 'jpg',
                                src: filepathfoldertemp,
                                dest: filepathfolder,
                                height: 100,
                                width: 100,
                                gravity: "center"
                            }, 
    function (err, filePath) {
                                // do something 
                                fs.unlinkSync(filepathfoldertemp);
                            }
                        );

            
 

                    });
                }
               
                var pushObject = { "Date": new Date(), "UserId": data.UserId , "Url": data.Url, "Thumb": filepathbase, "TabId": tabid };
                io.to(tabid).emit("tab navigate", { "TabId": tabid , "Map": pushObject });
                
                
                
                
                dal.query("INSERT INTO History", pushObject, function (data) {
                    
                });
            
            
            
                      
                 
            }
        });
        
        socket.on('tab connect', function (data, userid) {
            console.log(data);
            
            var tabid = data._id.toString();
            if (socket.rooms.indexOf(tabid) === -1)
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
                            if (data.error === undefined) {
                                delete data.Password;
                                delete data.Token;
                                io.to(tabid).emit("tab connected", { "TabId": tabid , "User": data });
                            }
                        })
                    }
                    
                    
                    global.Rooms[tabid] = result;
                    
                }
            })

        //}
        //else {
        //    socket.join(data._id);
        //}
        

        });
        
        socket.on('tab create', function (data) {
            
            if (global.Rooms[data._id] === undefined)
                global.Rooms[data._id] = data;
            socket.room = data._id;
            
            if (socket.rooms.indexOf(data._id) === -1)
                socket.join(data._id);
            
            
            
            dal.getSingle("Users", data.UserId, function (user) {
                delete user.Password;
                delete user.Token;
                io.to(data._id).emit("tab connected", { "TabId": data._id , "User": user });
            })
            
            
            console.log("created room: " + data);
        });
        
        
        socket.on('page scroll', function (tabid, userid, details) {
            io.to(tabid).emit("page scroll", { "tabid": tabid , "details": details });
    
        });
        
        socket.on('post message', function (tabid, userid, message) {
            var pushObject = { "Date": new Date(), "Message": message, "UserId": userid, "TabId": tabid };
            var sql = "INSERT INTO Comments";
            dal.query(sql, pushObject, function (data) {
                io.to(tabid).emit("commentAdded", { "tabid": tabid , "comment": pushObject });
            });
        
        
        
        //tabid, "Tabs", "Comments" , pushObject, function (data) {
        //    io.to(tabid).emit("commentAdded", { "tabid": tabid , "comment": pushObject });
        //});
        });
        
        socket.on('pop member', function (tabid, url, userid) {
            var pushObject = { "Date": new Date(), "Url": url, "UserId": userid };
            io.to(tabid).emit("pop member", { "TabId": tabid , "Map": pushObject });
        });
    });
}

function url2filename(str) {
    return str.split("?")[0].replace(/\//g, '').replace(/:/g, '').replace(/\./g, '');
}


module.exports = socketuse;