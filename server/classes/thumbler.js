

var thumbler = function () {
    
    var express = require('express');
    var router = express.Router();
    var fs = require('fs');
    var util = require('util');
    var path = require('path');
    var dal = require('./dal');
    var webshot = require('webshot');
    var moment = require('moment');
    
    this.capture = function (data, actionGuid, finishcallback) {
        
        var tabid = data.TabId;
        
        var dateKey = moment().format("MM_YYYY");
        
        var dir = path.resolve(global.appRoot, 'public/url_images/' + dateKey);
        var slidedir = path.resolve(global.appRoot, 'public/slide_images/' + dateKey);
        var filepathbase = dateKey + "/" + actionGuid + ".png";
        
        var filepathfolder = "public/url_images/" + filepathbase;
        var filepathfolderdisc = global.appRoot + "\\public\\url_images\\" + dateKey + "\\" + actionGuid + ".png";
        var filepathfoldertemp = "public/url_images/" + dateKey + "/temp" + actionGuid + ".png";
        var filepathfolderdisctemp = global.appRoot + "\\public\\url_images\\" + dateKey + "\\temp" + actionGuid + ".png";
         finishcallback();
         
         
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(slidedir)) {
            fs.mkdirSync(slidedir);
        }
        
        if (!fs.existsSync(filepathfolderdisc)) {
            
            
           
            
            

            
           
           

            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
        try{
            fs.createReadStream(path.resolve(global.appRoot, 'public/images/temp.png')).pipe(fs.createWriteStream(filepathfolderdisc));
        }catch(e){
            
            console.log("error creating file");
        }
        try{
            fs.createReadStream(path.resolve(global.appRoot, 'public/images/temp.png')).pipe(fs.createWriteStream(filepathfolderdisc.replace('url_images', 'slide_images')));
        }catch(e)
        {
            console.log("error creating file");
        }
            
            var options = {
                renderDelay: 5000,
                screenSize: {
                    width: 1024
                    , height: 768
                }
                , shotSize: {
                    width: 1024
                    , height: 768
                }, zoomFactor: 1,
                userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
            }
            
            webshot(data.Url, filepathfoldertemp, options, function (err) {
                
                if(err !== null)
                    return;
                    
                
                if (!fs.existsSync(filepathfoldertemp))
                    return;
                
                fs.unlinkSync(filepathfoldertemp);
                                finishcallback();
                                
                                return;
                                
                
                var Jimp = require("jimp");
                // open a file called "lenna.png" 
                console.log(filepathfoldertemp);
                Jimp.read(filepathfoldertemp, function (err, slideimage) {
                    console.log(err);
                    if (err) throw err;
                    
                    slideimage.resize(260, 182)            // resize 
                         .quality(60)                 // set JPEG quality 
                         //.greyscale()                 // set greyscale 
                         .write(filepathfolder.replace('url_images', 'slide_images')); // save 
                          console.log(filepathfolder.replace('url_images', 'slide_images'));
                         
                        Jimp.read(filepathfoldertemp, function (err, slideimage) {
                            console.log(err);
                            
                        if (err) throw err;
                        
                        slideimage.resize(100, 80)            // resize 
                        .quality(60)                 // set JPEG quality 
                        //.greyscale()                 // set greyscale 
                        .write(filepathfolder); // save 
                        
                           fs.unlinkSync(filepathfoldertemp);
                                finishcallback();
                        
                        });
                
                
                });
                
                
               
                
                
    //             var resizeCrop = require('resize-crop');
                
    //             resizeCrop(
    //                 {
    //                     format: 'jpg',
    //                     src: filepathfoldertemp,
    //                     dest: filepathfolder.replace('url_images', 'slide_images'),
    //                     height: 180,
    //                     width: 260,
    //                     gravity: "center"
    //                 }, 
    // function (err, filePath) {
                        
    //                     resizeCrop(
    //                         {
    //                             format: 'jpg',
    //                             src: filepathfoldertemp,
    //                             dest: filepathfolder,
    //                             height: 80,
    //                             width: 100,
    //                             gravity: "center"
    //                         }, 
    // function (err, filePath) {
    //                             // do something 
    //                             fs.unlinkSync(filepathfoldertemp);
    //                             finishcallback();

    //                         }
    //                     );
                        

    //                     // do something 
    //                     //fs.unlinkSync(filepathfoldertemp);
    //                 }
    //             );

            
 

            });
        }

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

module.exports = thumbler;