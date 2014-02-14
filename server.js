
var express = require('express'),
    app = express();

//server configuration  
app.use(express.bodyParser());
app.use(express.static(__dirname));

//start
app.listen(30303);