//var port = process.env.PORT || 3000,
//    http = require('http'),
//    fs = require('fs'),
//    html = fs.readFileSync('index.html');
//
//var log = function(entry) {
//    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
//};
//
//var server = http.createServer(function (req, res) {
//    if (req.method === 'POST') {
//        var body = '';
//
//        req.on('data', function(chunk) {
//            body += chunk;
//        });
//
//        req.on('end', function() {
//            if (req.url === '/') {
//                log('Received message: ' + body);
//            } else if (req.url = '/scheduled') {
//                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
//            }
//
//            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
//            res.end();
//        });
//    } else {
//        res.writeHead(200);
//        res.write(html);
//        res.end();
//    }
//});

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

// Set server port
app.listen(3000);
console.log('server is running');



// Listen on port 3000, IP defaults to 127.0.0.1
//server.listen(port);

// Put a friendly message on the terminal
//console.log('Server running at http://127.0.0.1:' + port + '/');
