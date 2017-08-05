// set variables for environment
var express = require('express');
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var path = require('path');

var fs = require('fs');
var PNG = require('pngjs').PNG;

var AWS      = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

var s3Stream = require('s3-upload-stream')(new AWS.S3());

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
var io = socket(server);

io.of('/drawing.html').on('connection', newConnection)


function newConnection(socket) {
    console.log('New Connection: ' + socket.id)
    
    socket.on('mouse', mouseMsg)
    
    function mouseMsg(data) {
        console.log('rec' + data);
        socket.broadcast.emit('mouse', data);
        // io.sockets.emit --- emit to everyone
    }
}

app.post('/sendFile',function(req,res){
    var body = req.body;
    var pixels = JSON.parse(body['pixels']);
    var png = new PNG({
        width: 32,
        height: 32,
        filterType: -1
    });

    for (var y = 0; y < png.height; y++) {
        for (var x = 0; x < png.width; x++) {
            var idx = (png.width * y + x) << 2;
            png.data[idx  ] = pixels[idx/4][0];
            png.data[idx+1] = pixels[idx/4][1];
            png.data[idx+2] = pixels[idx/4][2];
            png.data[idx+3] = 255;
            console.log("Setting: " + idx/4 + " TO: " + pixels[idx/4][0] + " , " + pixels[idx/4][1] + " , " + pixels[idx/4][2])
        }
    }
    var fileName = new Date().getTime() + '.png';
    var upload = s3Stream.upload({
      "Bucket": "rgbmatrix-pictures",
      "Key": fileName
    });
    png.pack().pipe(upload);
    res.end("yes");
});