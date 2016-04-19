/// <reference path="node/node.d.ts" />

// add this to the VERY top of the first file loaded in your app
var opbeat = require('opbeat').start({
  appId: 'ee9611ec98',
  organizationId: '25b4422919b94bccb4393618efed18d4',
  secretToken: 'a3b776cfceb1dcddea52af25bd9a7de64e847e9e'
})



global.appRoot = __dirname;
global.api_token = "DA113CED-66D3-4BFD-9EE2-873848CE000A";
 
var  express = require('express');
var  cors = require('cors')
var  fs = require('fs');
var  path = require('path');
var  favicon = require('serve-favicon');
var  logger = require('morgan');
var  cookieParser = require('cookie-parser');
var  bodyParser = require('body-parser');
var  url = require('url');
var  querystring = require('querystring');
var  dal = require('./classes/dal.js');
var  config = require('./classes/config.js');
var  moment = require('moment');
var  SocketUse = require('./classes/socket.js');
var  http = require('http');


const app = express();


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
    limit: '50mb',
}))

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use("/juntify", require('./routes/juntify.js'));
app.use("/monitor", require('./routes/monitor.js'));
app.use("/user", require('./routes/user.js'));
app.use("/tabs", require('./routes/tabs.js'));
 
 



 
console.log("init complete");
console.log("juntas is online at cloud9");
global.Rooms = {};
module.exports = app;
