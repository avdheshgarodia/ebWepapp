// set variables for environment
var express = require('express');
var app = express();
var path = require('path');

// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); // instruct express to server up static assets
app.use(express.static('public'));

// set routes
app.get('/', function(req, res) {
    res.render('index');
});

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
});

var socket = require('socket.io');
var io  = require('socket.io')(server, { path: '/myapp/socket.io'});


io.sockets.on('connection', newConnection)


function newConnection(socket) {
    console.log('New Connection: ' + socket.id)
    
    socket.on('mouse', mouseMsg)
    
    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data);
        // io.sockets.emit --- emit to everyone
    }
}