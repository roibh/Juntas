var _api = (function () {
    
    var config = require('./config.js');
    var dal = require('./dal.js');
    var util = require('util');
    var fs = require('fs');
    var path = require('path');
    var express = require('express');
    var assert = require('assert');
    var moment = require('moment');
    
    
    var RRule = require("rrule").RRule;
    
    function cleanEntityFramework(body, level) {
        if (body != null) {
            for (var key in body) {
                if (key.indexOf("$") == 0 || key == "EntityKey") {
                    delete body[key];
                    continue;
                }
                if (Array.isArray(body[key])) {
                    for (var x = 0; x < body[key].length; x++) {
                        var subObj = body[key][x];
                        cleanEntityFramework(subObj, level++);
                        
                    }

                }
                
                if (typeof (body[key]) == "object") {
                    
                    cleanEntityFramework(body[key], level++);
                    //for (var x in body[key]{
                    //    var subObj = body[key][x];
                    //    cleanEntityFramework(body[key], level++);
                        
                    //}

                }
                //query += key + "=@" + key + and;
            }
        }
       

    }
    
    function getOperator(key) {
        var ops = {
            "$gt": ">"
        }
        
        if (ops[key] === undefined)
            return key;
        
        return ops[key];

    }
    
    var publicEntities = ["Languages", "Navigation"];
    function _validateUser(token, entity, callback) {
        
        
        if (publicEntities.indexOf(entity) > -1) {
            callback(null, undefined);
            return;
        }
        var query = "SELECT * FROM Patients WHERE Token=@Token";
        dal.query(query, { "Token": token }, function (result) {
            
            var data = { items: result }
            if (result === null || result.length == 0)
                callback("Access denied");
            else
                callback(null, data.items[0]._id);
        });

    }
    
    function performCalendarSearch(searchObj, callback) {
        var rangeResponse = {};
        var finalResult = [];

        //get valid simple events
        dal.query("SELECT * FROM EventDatas WHERE PatientId=@PatientId AND StartDate>@StartDate AND EndDate<@EndDate AND RecurrenceRule=@RecurrenceRule",
             { "PatientId": searchObj["PatientId"], "StartDate": searchObj["StartDate"], "EndDate": searchObj["EndDate"],"RecurrenceRule": "" }, function (items) {
            for (var i = 0; i < items.length; i++) {
              
                var dateEventEntity = {
                    "_id": items[i]._id,
                    "Subject": items[i].Subject,
                    "StartDate": new Date(items[i].StartDate).toISOString(),
                    "EndDate": new Date(items[i].EndDate).toISOString(),                            
                    
                    "Action":
 {
                        "ActivityIntensity": items[i].ActivityIntensity,
                        "ActivityType": items[i].ActivityType,
	 
	 
                    },
                    "Recurrence": null

                }
                            
                finalResult.push(dateEventEntity);

            }
            
            
            //now get the calculated values
            dal.query("SELECT * FROM EventDatas WHERE PatientId=@PatientId AND RecurrenceRule!=@RecurrenceRule",
             { "PatientId": searchObj["PatientId"], "RecurrenceRule": "" }, function (items) {
                
                var current = moment(searchObj["StartDate"]);
                
               
                for (var i = 0; i < items.length; i++) {
                    if (items[i].RecurrenceRule != "" && items[i].RecurrenceRule !== undefined) {
                        
                        
                        var rule = RRule.fromString(items[i].RecurrenceRule);
                        rule.options.dtstart = new Date(items[i].StartDate);
                        rule.options.until = new Date(searchObj["EndDate"]);

                   
            
            

                        var startDate = new Date(items[i].StartDate);
                        var endDate = new Date(items[i].EndDate);
                        var dates = rule.between(new Date(searchObj["StartDate"]), new Date(searchObj["EndDate"]) );
                        
                        for (var dateIndex = 0; dateIndex < dates.length; dateIndex++) {
                            var cc = moment(dates[dateIndex]).diff(rule.options.dtstart, 'minutes');
                            var cc1 = moment(rule.options.dtstart).diff(dates[dateIndex], 'minutes');
                            
                            
                            //if (moment(rule.options.dtstart).diff(dates[dateIndex], 'minutes') <= 0)
                            //    continue;

                            //if (moment(dates[dateIndex]) < moment(rule.options.dtstart))
                            //    continue;

                            var stime = new Date(dates[dateIndex].getFullYear(), dates[dateIndex].getMonth(), dates[dateIndex].getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
                            var etime = new Date(dates[dateIndex].getFullYear(), dates[dateIndex].getMonth(), dates[dateIndex].getDate(), endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());
                            

                            var dateEventEntity = {
                                "_id": items[i]._id,
                                "Subject": items[i].Subject,
                                "StartDate": stime.toISOString(),
                                "EndDate": etime.toISOString(),                                
                                
                                "Action":
 {
                                    "ActivityIntensity": items[i].ActivityIntensity,
                                    "ActivityType": items[i].ActivityType,
	 
	 
                                },
                                "Recurrence": getRecurrenceFormat(items[i], rule)

                            }
                            

                            finalResult.push(dateEventEntity);
                        }
                        
                        
                        
                        
                        
                        
                        
                        
                        var xxx = 1;
                        

                       // var rule  = Rrecur.parse(items[i].RecurrenceRule);
                       // var rrecur  = Rrecur.create({
                       //     dtstart: {
                       //         zoneless: new Date(searchObj["StartDate"]).toISOString() ,// Rrecur.toLocaleISOString(new Date(searchObj["StartDate"]), "GMT-0400 (EDT)") ,// Rrecur.toLocaleISOString(), //, "GMT-0400 (EDT)"
                       //        locale: "-0400" //Rrecurlib.Rrecur.toLocaleISOString()
                       //     }
                       //     , rrule: rule
                       // }, moment(searchObj["EndDate"]).toDate(), moment(searchObj["StartDate"]).toDate(), "+0200");
                       //var p =  rrecur.next(moment(searchObj["EndDate"]).toDate());
                       
                       //var s = p;
                       
                        //var x = rrecur.next(moment(searchObj["StartDate"]).toDate());
                       // rules, today, dtstart,
                        
                                             
                        
                    }
                }
                
                callback(null, { items: finalResult });
            }
            );
            
           
        
        
        });


//dal.connect(function (err, db) {
//    db.collection("EventDatas").find({ "PatientId": searchObj["PatientId"] }).sort({ "StartDate": 1 })
//                 .each(function (err, doc) {
//        assert.equal(err, null);
//        if (doc != null) {
//            var journal = doc;

//            //check for simple dates first


//            rangeResponse.push(journal);


//        }
//        else {

//            callback(null, rangeResponse);
//        }
//    });


//});
//load journal





    }
    
    
    function getRecurrenceFormat(obj, rule) {
        
        return {
            "RecurrenceId": obj._id,
            "Frequency": "week",
            "interval": 2,
            "schedule":                   // optional (advanced scheduling specifics)
 {
                "weekDays": ["monday", "wednesday", "friday"],
                "hours": ['10:00', '22:00']
            },
            "Count": 10,                 // optional (רק אם יש מספר מופעים מוגדר מראש)
            "ExpirationTime": "2012-11-04",      // optional (רק אם יש תאריך תפוגה/סיום למחזוריות)
        }


    }
    
    function _start(app) {
        
        
        
        var router = express.Router();
        router.route('/*')
        .get(function (req, res) {
            
            var entity = req.params[0];
            
            _validateUser(req.headers["token"], entity, function (err, PatientId) {
                if (err !== undefined && err !== null) {
                    res.status(403).send({ error: "invalid token" });
                    return;
                   
                }
                
                if (entity === "EventsDataRange") {
                    if (PatientId !== undefined)
                        req.query["PatientId"] = PatientId;
                    
                    performCalendarSearch(req.query, function (err, result) {
                        res.end(JSON.stringify(result));
                    })
                    return;

                }
                
                // if (err !== undefined){
                //     res.send(err);
                //     return;
                //    
                // }
                if (PatientId !== undefined)
                    req.query["PatientId"] = PatientId;
                
                var where = "";
                var whereObj = {};
                var and = " AND ";
                if (req.query != null) {
                    where = " WHERE ";
                    for (var key in req.query) {
                        try {
                            if (JSON.parse(req.query[key])) {
                                var op = JSON.parse(req.query[key]);
                                var found = 0;
                                for (var i in op) {
                                    
                                    
                                    if (key.indexOf('$') == 0) {
                                        //special operator
                                        where += key + "^^" + "@" + key + and;
                                        whereObj[key] = op;
                                    }
                                    else {
                                        where += key + getOperator(i) + "@" + key + and;
                                        whereObj[key] = op[i];
                                    }
                                    found = 1;
                                    
                                    break;
                                }
                                if (found == 0) {
                                    where += key + "^^" + "@" + key + and;
                                    whereObj[key] = op;
                                }
                            }
                            else {
                                where += key + "=@" + key + and;
                                whereObj[key] = req.query[key];
                            }
                        } catch (e) {
                            where += key + "=@" + key + and;
                            whereObj[key] = req.query[key];
                        }
                    
                    }
                    
                    where = where.substring(0, where.length - and.length);
                    if (where == " WHERE ")
                        where = "";
                }
                var query = "SELECT * FROM " + entity + where + ";";
                dal.query(query, whereObj, function (result) {
                    
                    var data = { items: result }
                    res.end(JSON.stringify(data));
                });
            });


        })
        .post(function (req, res) {
            if (!req.body) return res.sendStatus(400);
            var entity = req.params[0];
            var and = ",";
            var query = "INSERT INTO " + entity + " ";
            var body = req.body;
            if (body.data !== undefined)
                body = JSON.parse(body.data);
            
            if (body.length !== undefined) {
                for (var i = 0; i < body.length; i++) {
                    
                    cleanEntityFramework(body[i], 0);
                    
                    
                    
                    dal.query(query, body[i], function (apiResult) {
                        var data = { items: apiResult.ops }
                        if (i == body.length)
                            res.end(JSON.stringify(data));
                    });
                


                }


            }
            else {
                
                
                
                if (body != null) {
                    for (var key in body) {
                        query += key + "=@" + key + and;
                    }
                }
                dal.query(query, body, function (apiResult) {
                    var data = { items: apiResult.ops }
                    res.end(JSON.stringify(data));
                });
            }

        })
        .put(function (req, res) {
            if (!req.body) return res.sendStatus(400);
            var entity = req.params[0];
            var and = ",";
            
            var query = "UPDATE " + entity + " SET ";
            
            if (req.body != null) {
                for (var key in req.body) {
                    if (key !== "")
                        query += key + "=@" + key + and;
                }
            }
            dal.query(query, req.body, function (apiResult) {
                var data = { items: apiResult.ops }
                res.end(JSON.stringify(data));
            });

        })
        .delete(function (req, res) {
            if (!req.body) return res.sendStatus(400);
            var entity = req.params[0];
            var and = " AND ";
            
            var query = "DELETE FROM " + entity + " WHERE ";
            
            if (req.query != null) {
                for (var key in req.query) {
                    if (key !== "")
                        query += key + "=@" + key + and;
                }
            }
            dal.query(query, req.query, function (apiResult) {
                var data = { items: apiResult.ops }
                res.end(JSON.stringify(data));
            });

        });
        
        app.get('/api/EventsDataRange', function (req, res) {
            var xxx = 1;

        
        
        });
        app.use('/api', router);

        
    }
    return {
        start: _start,
        validateUser: _validateUser
    };
})();
// node.js module export
module.exports = _api;