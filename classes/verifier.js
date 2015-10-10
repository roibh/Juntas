

var verifier = function () {
    
    var express = require('express');
    var router = express.Router();
    var fs = require('fs');
    var util = require('util');
    var path = require('path');
    var dal = require('./dal');
    var webshot = require('webshot');
    var moment = require('moment');
    
    this.verify = function (data, callback) {
        
        var tabid = data.TabId;
        
        var dateKey = moment().format("MM_YYYY");
        
            
           
        var request = require('request')
        var url = data.Url;
        
        var urlkey = url.hashCode();

        dal.connect(function (err, db) {
        
            db.collection("Metadata").findOne({ "hash": urlkey }, function (err, metadata) { 
            
                if (metadata === null) {

                    // use a timeout value of 10 seconds
                    var timeoutInMilliseconds = 10 * 1000
                    var opts = {
                        encoding: 'utf-8',
                        url: url,
                        timeout: timeoutInMilliseconds
                    }
                    
                    request(opts, function (err, res, body) {
                        if (err) {
                            console.dir(err)
                            return
                        }
                        var statusCode = res.statusCode
                        var cheerio = require('cheerio'),
                            $ = cheerio.load(body);
                        
                        var t = $('meta');
                        var ttag = $('title');
                        var saveObject = {"hash": urlkey };

                        for (var i = 0; i < t.length; i++) {
                            if (t[i].attribs.property !== undefined) {
                                saveObject[t[i].attribs.property] = t[i].attribs.content;
                            }
                            else {
                                saveObject[t[i].attribs.name] = t[i].attribs.content;
                            }
                            
                        }
                        
                        if (ttag.length > 0)
                            saveObject["title"] = ttag[0].children[0].data;// ttag.children[0].data;

                        db.collection("Metadata").save(saveObject, function (err, result) { 
                        
                            callback(saveObject);
                        
                        })
                        

                    })

                }
                else {
                    callback(metadata);
                }
            
            })
        });

        
            

            
           
           

            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
             

    }
    
    this.url2filename = function (str) {
        
        return str.hashCode();//.split("?")[0].replace(/\//g, '').replace(/:/g, '').replace(/\./g, '');
    }
    
    
    
    
    return this;
}()

String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

module.exports = verifier;