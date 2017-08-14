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
app.set('view options', {pretty: true});
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
io.of('/ludo.html').on('connection', newludoPlayer)




//LUDO GAME


var COLORS  = ['RED', 'GREEN', 'YELLOW', 'BLUE']
var MAX_NUMBER_PLAYERS = 4;
var currentNumberOfPlayers = 0;
var currentPlayer = 0;
var playersList = [];
var gameBoard = [];

function newludoPlayer(socket) {
    console.log('A player has connected: ' + socket.id)
    
    if(currentNumberOfPlayers<MAX_NUMBER_PLAYERS){
        
            console.log(socket.id + ' Joined the game');
            playersList.push(new player(socket.id, currentNumberOfPlayers));
            
            playersList[currentNumberOfPlayers]
            
            socket.emit('playerJoined', { id: socket.id, color: currentNumberOfPlayers, isLocal: true, players: playersList});
        
        
            socket.broadcast.emit('playerJoined', { id: socket.id, color: currentNumberOfPlayers, isLocal: false, players: playersList} );
        
            currentNumberOfPlayers++;
        
        //while(true){
            //socket.to(socket.id).emit('makemove', 'I just met you');
        //}
        
        //EMIT ALL GAME DATA
        //PLAYERS AND POSITIONS
        //socket.broadcast.emit('mouse', data);
    
    }else{
        console.log('Error');
        socket.emit('failure',{errorCode: 'Too Many Players'});
    }
    
    socket.on('ready', function(data) {
        playersList.forEach(function(p) {
            if(p.color == data.color){
                p.ready = true;
            }
        });
        
        if(currentNumberOfPlayers>1 && allPlayersReady()){
            
            for(i = 0; i < 4; i++){
                var tempPlayer = {};
                tempPlayer.colorIndex = i;
                tempPlayer.piecesInStart = 4;
                tempPlayer.piecesInHome = 0;
                tempPlayer.piecesInEnd = 0;
                tempPlayer.piecesInPlay = 0;
                tempPlayer.pieceLocations = [];
                tempPlayer.endLocations = [];
                tempPlayer.hasKilled = false;
                gameBoard.push(tempPlayer);
            }
            
            socket.emit('gameStart', { board: gameBoard});
            socket.broadcast.emit('gameStart', { board: gameBoard});
            console.log('gameLoop');
            gameLoop(socket);
        }
        
    });
    
    socket.on('move', function(data) {
        currentPlayer = (currentPlayer+1)%currentNumberOfPlayers;
        gameBoard = data.board;
        gameLoop(socket)
    });
    
    socket.on('reset', function(data) {
        currentNumberOfPlayers = 0;
        currentPlayer = 0;
        playersList = [];
        gameBoard = [];
    });
    
    
//    // Called when the client calls socket.emit('move')
//    socket.on('move', function(msg) {
//        socket.broadcast.emit('move', msg);
//    });

}

function gameLoop(socket){
    
    if (typeof gameBoard == 'undefined'){
        console.log('Game Board is Undefined') 
    }
    
    socket.emit('makeMove', { board: gameBoard, player: currentPlayer});
    socket.broadcast.emit('makeMove', { board: gameBoard, player: currentPlayer});
}


function allPlayersReady(){
    playersList.forEach(function(p) {
        if( p['ready'] == false){
            return false;
        }
    });
    return true
}

function player(id, color) {
    this.id = id;
    this.color = color;
    this.ready = false;
    console.log('New player Creation:' + color)
}















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