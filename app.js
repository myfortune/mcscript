//modules
const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'html'));


//middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var routes = require('./server/routes/index');
app.use(routes);


// start the server with the port
var port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('listening on port ' + port);
});

