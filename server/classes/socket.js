
var socketuse = function(io) {


    var express = require('express');
    var router = express.Router();
    var fs = require('fs');
    var util = require('util');


    var path = require('path');
    var dal = require('./dal');
    var ObjectID = require("mongodb").ObjectID;
    var moment = require('moment');
    var thumbler = require('./thumbler.js');
    var verifier = require('./verifier.js');


    var ObjectID = require("mongodb").ObjectID;



    io.on('connection', function(socket) {

        socket.on('disconnect', function(){
            
            var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
            dal.query(query, {
                "Followers": [socket.userid]
            }, function(items) {
                for (var i = 0; i < items.length; i++) {
                    var tid = items[i]._id.toString();
                    if (global.Rooms[tid] !== undefined && global.Rooms[tid].online && global.Rooms[tid].online[socket.userid]) {
                      delete  global.Rooms[tid].online[socket.userid];
                    }
                }
            });
                    
        });


        socket.on('juntas connect', function(data) {

            socket.userid = data.UserId;

            var query = "SELECT * FROM Tabs WHERE Followers in @Followers";
            dal.query(query, {
                "Followers": [data.UserId]
            }, function(items) {
                for (var i = 0; i < items.length; i++) {
                    var tid = items[i]._id.toString();
                    
                   
                    
                    if (!socket.rooms["/#" + tid])
                        socket.join(tid);


 
 
                   
                }
            });


            var tabid = data.TabId;
            if (global.Rooms[tabid] !== undefined) {

                var pushObject = {
                    "Date": new Date(),
                    "UserId": data.UserId,
                    "Url": data.Url
                };

                dal.pushObject(tabid, "Tabs", "History", pushObject, function(data) {
                    io.to(tabid).emit("tab navigate", {
                        "TabId": tabid,
                        "Map": pushObject
                    });

                });
            }
        });
        
      socket.on('user is typing', function(tabid, userid) {
          
             io.to(tabid).emit("user is typing", {
                                "TabId": tabid,
                                "UserId": userid
                            });
           
      });
  
  
  
  
        socket.on('tab navigate', function(data) {
            var tabid = data.TabId;
            
            
             if (global.Rooms[tabid] === undefined) 
                    {
                        global.Rooms[tabid] = {};
                        global.Rooms[tabid].online = {};
                        global.Rooms[tabid].online[data.userid] = true;
                    }
                    else
                    {
                        if(!global.Rooms[tabid].online)
                                global.Rooms[tabid].online = {};
                        
                       global.Rooms[tabid].online[data.userid] = true; 
                        
                    }
                    
                    
            
            if (global.Rooms[tabid] !== undefined) {

                verifier.verify(data, function(metadata) {
                    var actionGuid = thumbler.url2filename(data.Url);
                    var filepathbase = moment().format("MM_YYYY") + "/" + actionGuid + ".png";
                    if (metadata["og:image"] !== undefined) {
                        filepathbase = metadata["og:image"];
                    }
                    else if(data.Url.indexOf('.png') > 0 || data.Url.indexOf('.jpg') > 0  ){
                        filepathbase = data.Url;
                        
                    }
                    else
                    {
                        filepathbase = "noimage.png";    
                    
                    }
                  /*  else {
                        thumbler.capture(data, actionGuid, function() {
                            io.to(tabid).emit("image captured", {
                                "TabId": tabid,
                                "FileName": filepathbase
                            });
                        });
                    }*/
                    
                     io.to(tabid).emit("image captured", {
                                "TabId": tabid,
                                "FileName": filepathbase
                            });
                    
                    if (metadata["title"] !== undefined) {
                        data.Title = metadata["title"];
                    }

                    var _id = new ObjectID();

                    var pushObject = {
                        "_id": _id,
                        "hash": actionGuid,
                        "Title": data.Title,
                        "Date": new Date(),
                        "UserId": data.UserId,
                        "Url": data.Url,
                        "Thumb": filepathbase,
                        "TabId": tabid
                    };
                    io.to(tabid).emit("tab navigate", {
                        "TabId": tabid,
                        "Map": pushObject
                    });
                    dal.connect(function(err, db) {
                        if(err=== null){
                        db.collection("History").findOne({
                            "hash": pushObject.hash,
                            "UserId": pushObject.UserId,
                            "TabId": pushObject.TabId
                        }, function(err, data) {
                            if (data === null)
                                dal.query("INSERT INTO History", pushObject, function(data) {});
                        })
                        }
                    })
                })
            }
        });

        socket.on('tab connect', function(data, userid) {
             

            var tabid = data._id.toString();
          
                    
            if (socket.rooms.indexOf && !socket.rooms.indexOf(tabid) ===-1)
                socket.join(tabid);

            console.log("connecting to room:" + tabid);
          //  if (socket.rooms.indexOf(tabid) === -1)
          //      socket.join(tabid);
            //if (Rooms[tabid] === undefined) {
            dal.getSingle("Tabs", tabid, function(result) {
                if (result !== null) {
                    if (result.Followers === undefined)
                        result.Followers = [];

                    if (result.Followers.indexOf(userid) == -1) {
                        result.Followers.push(userid)
                        dal.pushObject(ObjectID(tabid), "Tabs", "Followers", userid, function(data) {
                            dal.getSingle("Users", userid, function(data) {
                                delete data.Password;
                                delete data.Token;







                                io.to(tabid).emit("tab connected", {
                                    "TabId": tabid,
                                    "User": data
                                });
                            })

                        })
                    }
                    else {
                        dal.getSingle("Users", ObjectID(userid), function(data) {
                            if (data.error === undefined) {
                                delete data.Password;
                                delete data.Token;
                                io.to(tabid).emit("tab connected", {
                                    "TabId": tabid,
                                    "User": data
                                });
                            }
                        })
                    }


                   
                    
                     if (global.Rooms[tabid] === undefined) {
                          global.Rooms[tabid] = result;
                        global.Rooms[tabid].online = {};
                        global.Rooms[tabid].online[socket.userid] = true;
                    }
                    else
                    {
                        if(!global.Rooms[tabid].online)
                                global.Rooms[tabid].online = {};
                        
                       global.Rooms[tabid].online[socket.userid] = true; 
                        
                    }
                    

                }
            })
        });

        socket.on('tab create', function(data) {

            if (global.Rooms[data._id] === undefined)
                global.Rooms[data._id] = data;
            socket.room = data._id;

 
            if (!socket.rooms["/#" + data._id])
                        socket.join(data._id);

          //  if (socket.rooms.indexOf(data._id) === -1)
          //      socket.join(data._id);



            dal.getSingle("Users", data.UserId, function(user) {
                delete user.Password;
                delete user.Token;
                io.to(data._id).emit("tab connected", {
                    "TabId": data._id,
                    "User": user
                });
            })


            console.log("created room: " + data);
        });

        socket.on('page scroll', function(tabid, userid, details) {
             
            io.to(tabid).emit("page scroll", {
                "TabId": tabid,
                "UserId": userid,
                "details": details
            });

        });
 



   


        socket.on('webrtc send offer', function(tabid, userid, offer) {
           
            socket.broadcast.to(tabid).emit("webrtc create offer", {
                "TabId": tabid,
                "UserId": userid,
                "offer": offer
            });

        });
        
             socket.on('webrtc send answer', function(tabid, userid, offer) {
           
            socket.broadcast.to(tabid).emit("webrtc offer accepted", {
                "TabId": tabid,
                "UserId": userid,
                "offer": offer
            });

        });
        
               socket.on('webrtc ice candidate', function(tabid, userid, ice) {
           
                socket.broadcast.to(tabid).emit("webrtc ice candidate", {
                    "TabId": tabid,
                    "UserId": userid,
                    "ice": ice
                });

        });
        
        
        
        
        
        
        
        
        
        socket.on('post message', function(tabid, userid, message) {
            var pushObject = {
                "Date": new Date(),
                "Message": message,
                "UserId": userid,
                "TabId": tabid
            };
            var sql = "INSERT INTO Comments";
            dal.query(sql, pushObject, function(data) {
                io.to(tabid).emit("commentAdded", {
                    "tabid": tabid,
                    "comment": pushObject
                });
            });



            //tabid, "Tabs", "Comments" , pushObject, function (data) {
            //    io.to(tabid).emit("commentAdded", { "tabid": tabid , "comment": pushObject });
            //});
        });

        socket.on('pop member', function(tabid, url, userid) {
            var pushObject = {
                "Date": new Date(),
                "Url": url,
                "UserId": userid
            };
            io.to(tabid).emit("pop member", {
                "TabId": tabid,
                "Map": pushObject
            });
        });

        socket.on('delete history', function(tabid, userid, id) {
            dal.connect(function(err, db) {
                if (err === null) {
                    db.collection("History").remove({
                        "_id": ObjectID(id)
                    }, function() {
                        io.to(tabid).emit("delete history", {
                            "TabId": tabid,
                            "_id": id
                        });
                    })
                }
            })




        });

        socket.on('like url', function(tabid, userid, hash, rate, ratetext) {
            var pushObject = {
                "TabId": tabid,
                "UserId": userid
            };
            dal.connect(function(err, db) {
                if (err === null) {

                    var pusher = {};
                    pusher["Likes"] = pushObject;
                    db.collection("Metadata").update({
                        'hash': hash
                    }, {
                        $addToSet: pusher
                    }, function(err, data) {
                        if (err === null) {
                            io.to(tabid).emit("like url", {
                                "TabId": tabid,
                                "Map": pushObject,
                                "hash": hash
                            });
                        }
                    });
                }



            });





        });

    });
}
module.exports = socketuse;