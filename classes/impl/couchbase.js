var Dal = (function () {
    
    
    var util = require('util');
    var fs = require('fs');
    var path = require('path');
    
    var couchbase = require('couchbase');
    
   
    var private_variable = 'value';
    function private_function() {
        return obj;
    }
    function _query(queryStr, callback) {
        
        var myCluster = new couchbase.Cluster('couchbase://127.0.0.1');
        
        
        var myBucket = myCluster.openBucket("default");
        myBucket.enableN1ql(['http://127.0.0.1:8093/']);
        var N1qlQuery = couchbase.N1qlQuery;
        var query = N1qlQuery.fromString(queryStr);
        myBucket.query(query, callback);
        //function (err, res) {
        //    if (err) {
        //        console.log("query failed", err);
        //        return;
        //    }
        //    console.log("success!", res);
        //});

       // return obj;
    }
    return {
        query: _query
    };
})();
// node.js module export
module.exports = Dal;