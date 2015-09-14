var DataStudio = (function () {
    
    
    var util = require('util');
    var fs = require('fs');
    var path = require('path');
    var dal = require('./dal.js');
 
    
 
    function _getAll(callback) {
        
        
        
        dal.getAll(callback);
        //var query = "SELECT * FROM users WHERE email=@email AND password=@password;";
        //dal.query(query, {"email": email, "password": password}, function (user) {
        
        //    if (user == null) {

        //        user = {error: { message: "not found" }};
        //    }
            
        //        callback(user);
            


        //});

        
        

        
    }
    function _getCollection(name, callback) {
        dal.getCollection(name, callback);
    }
    function _getSchema(name, callback) {
        dal.getSchema(name, callback);
    }
    function _saveSchema(name, schema, callback) {
        dal.saveSchema(name,schema,  callback);
    }
    function _deleteCollection(name, id, callback) {
        dal.deleteCollection(name, id, callback);
    }
    function _getSingle(name, id, callback) {
        dal.getSingle(name, id, callback);
    }
    
    return {
        saveSchema: _saveSchema,
        getSchema: _getSchema,
        getAll: _getAll,
        deleteCollection: _deleteCollection,
        getSingle: _getSingle,
        getCollection: _getCollection
    };
})();
// node.js module export
module.exports = DataStudio;