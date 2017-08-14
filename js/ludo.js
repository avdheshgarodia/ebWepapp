var socket = io(location.href);

//CONSTANTS
var BOARD_WIDTH = 600;
var NUM_CELLS = 15;
var CELL_WIDTH = BOARD_WIDTH / NUM_CELLS
var STORKE_WIDTH = 2;
var WIDTH = BOARD_WIDTH + ((NUM_CELLS + 1) * STORKE_WIDTH);
var TOTAL_CELL_WIDTH = CELL_WIDTH + STORKE_WIDTH;
var POSITIONS = 52;

//COLORS
var GAME_COLORS = ['Green', 'Yellow', 'Blue', 'Red'];
var X_START_LOCATIONS = [[2, 3, 2, 3], [11, 12, 11, 12], [11, 12, 11, 12], [2, 3, 2, 3]];
var Y_START_LOCATIONS = [[2, 3, 3, 2], [2, 3, 3, 2], [11, 12, 12, 11], [11, 12, 12, 11]];
var START_LOCATIONS = [0, 13, 26, 39]
var XLocations = [1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 6, 7, 8, 8, 8, 8, 8, 8, 9, 10, 11, 12, 13, 14, 14, 14, 13, 12, 11, 10, 9, 8, 8, 8, 8, 8, 8, 7, 6, 6, 6, 6, 6, 6, 5, 4, 3, 2, 1, 0, 0, 0]
var YLocations = [6, 6, 6, 6, 6, 5, 4, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 6, 7, 8, 8, 8, 8, 8, 8, 9, 10, 11, 12, 13, 14, 14, 14, 13, 12, 11, 10, 9, 8, 8, 8, 8, 8, 8, 7, 6]
var mapXYtoPos = {}
var mapStartXYtoPos = []

//Game Variables
var playerColor;
var players = [];
var gameRunning = false;
var ourTurn = false;
var currentBoard = [];
var diceRoll = -1;

var selectedX = -1;
var selectedY = -1;
var selectedHome = false;


function setup() {
    
    for (i = 0; i < 4; i++) {
        var tempPlayer = {};
        tempPlayer.colorIndex = i;
        tempPlayer.piecesInStart = 4;
        tempPlayer.piecesInHome = 0;
        tempPlayer.piecesInEnd = 0;
        tempPlayer.piecesInPlay = 0;
        tempPlayer.pieceLocations = [];
        tempPlayer.endLocations = [];
        tempPlayer.hasKilled = false;
        currentBoard.push(tempPlayer);
    }


    buildmap();
    console.log('Intitial Board Setup');
    //COLORS
    BOARD = color(240, 240, 240);
    WHITE = color(255, 255, 255);
    BLACK = color(0, 0, 0);
    RED = color(255, 0, 0);
    BLUE = color(0, 0, 255);
    YELLOW = color(255, 255, 0);
    GREEN = color(0, 255, 0);
    STROKE = color(51, 51, 51)

    colors = [GREEN, YELLOW, BLUE, RED]


    board = createCanvas(WIDTH, WIDTH);
    board.position(50, 50);
    background(BOARD);
    drawBoard();

    socket.on('playerJoined', initializePlayer)
    socket.on('failure', showErrorMessage)
    socket.on('gameStart', gameStart)
    socket.on('makeMove', makeMove);


    readybutton = createButton('Ready');
    readybutton.position(WIDTH + 100, 100);
    readybutton.mousePressed(readyClick); // attach button listener

    resetbutton = createButton('Reset');
    resetbutton.position(WIDTH + 150, 300);
    resetbutton.mousePressed(resetClick); // attach button listener


    playersText = createDiv('Current Number of Players: ' + players.length);
    playersText.position(WIDTH + 150, 150);

    diceText = createDiv('');
    diceText.position(WIDTH + 150, 250);

    moveText = createDiv('');
    moveText.position(WIDTH + 150, 350);



    infoText = createDiv('Waiting FOr All Players to be Ready');
    infoText.position(WIDTH + 150, 200);


    mouseText = createDiv('');
    mouseText.position(WIDTH + 150, 700);

}

function makeMove(msg) {

    selectedX = -1;
    selectedY = -1;
    selectedHome = false;

    console.log("Players TURN: " + msg.player)
    updateBoard(msg.board);

    if (msg.player == playerColor) {
        infoText.html("Its Your Move")
        diceText.html('ROLLING')
        ourTurn = true;
        diceRoll = Math.floor(Math.random() * 6) + 1;
        diceText.html('You Rolled: ' + diceRoll);
    } else {
        ourTurn = false;
        infoText.html("Wait For Your Turn")
        diceText.html("");
    }
}

function returnMove() {
    socket.emit('move', {
        board: currentBoard
    });
}

function gameStart(msg) {
    console.log("Game Starting")
    gameRunning = true;
    updateBoard(msg.board);
}

function readyClick() {
    socket.emit('ready', {
        color: playerColor
    });
}

function resetClick() {
    socket.emit('reset', {});
    location.reload()
}

function initializePlayer(player) {

    if (!gameRunning) {

        if (player.isLocal) {
            playerColor = player.color
            colorText = createDiv('Your Color is: ' + GAME_COLORS[playerColor]);
            colorText.position(WIDTH + 150, 100);
        }
        players = player.players;
        console.log("Number Of Players in Game: " + players.length)
        playersText.html('Current Number of Players: ' + players.length)

    }
}



function draw() {

    if (gameRunning) {
        
        updateBoard(currentBoard)

        var xloc = mouseX - (mouseX % TOTAL_CELL_WIDTH);
        var yloc = mouseY - (mouseY % TOTAL_CELL_WIDTH);
        var x = xloc / TOTAL_CELL_WIDTH;
        var y = yloc / TOTAL_CELL_WIDTH;

        mouseText.html(mouseX + ',' + mouseY + ',' + x + ',' + y);

        if (mapStartXYtoPos[playerColor][x + ',' + y]) {
            drawPiece(x, y, BLACK)
        }

        currentBoard[playerColor].pieceLocations.forEach(function (loc) {
            if (XLocations[loc] == x && YLocations[loc] == y) {
                drawPiece(x, y, BLACK)
            }
        });
    }
}

function mouseClicked() {

    if (ourTurn && gameRunning) {

        var xloc = mouseX - (mouseX % TOTAL_CELL_WIDTH);
        var yloc = mouseY - (mouseY % TOTAL_CELL_WIDTH);
        var x = xloc / TOTAL_CELL_WIDTH;
        var y = yloc / TOTAL_CELL_WIDTH;

        if (mapStartXYtoPos[playerColor][x + ',' + y]) {
            selectedX = x;
            selectedY = y;
            selectedHome = true;
        }

        currentBoard[playerColor].pieceLocations.forEach(function (loc) {
            if (XLocations[loc] == x && YLocations[loc] == y) {
                drawPiece(x, y, BLACK)
                selectedX = x;
                selectedY = y;
                selectedHome = false;
            }
        });

        moveText.html('Picked Piece, ' + selectedX + selectedY + selectedHome)


        if (selectedX != -1) {
            //Player selected a piece 
            gameLogic();
        }

    }
}

function gameLogic() {
    if (selectedHome && currentBoard[playerColor].piecesInStart == 4) {
        if (diceRoll > 1 && diceRoll < 6) {
            console.log("All Pieces in Home");
            returnMove();
        }
    }
    
    if (selectedHome && currentBoard[playerColor].piecesInStart > 0) {
        if (diceRoll == 6 || diceRoll == 1) {
            console.log("Removing From Home");
            currentBoard[playerColor].piecesInStart--;
            currentBoard[playerColor].piecesInPlay++;
            currentBoard[playerColor].pieceLocations.push(START_LOCATIONS[playerColor]);
            updateBoard(currentBoard);
            returnMove();
        }
    }
    
    if (!selectedHome) {
        console.log("Other");
        index = -1;
        for (i = 0; i < currentBoard[playerColor].pieceLocations.length; i++) {
            if (mapXYtoPos[selectedX + ',' + selectedY] == currentBoard[playerColor].pieceLocations[i]) {
                index = i;
            }
        }

        if (index == -1) {
            console.log("ERROR");
        }

        currentBoard[playerColor].pieceLocations[index] += diceRoll;
        var newPos = currentBoard[playerColor].pieceLocations[index];

        for (p = 0; p < 4; p++) {
            if (p != playerColor) {
                for (i = 0; i < currentBoard[p].pieceLocations.length; i++) {
                    if (newPos == currentBoard[p].pieceLocations[i]) {
                        console.log("Kill");
                        currentBoard[playerColor].hasKilled = true;
                        currentBoard[p].pieceLocations.splice(i, 1);
                        currentBoard[p].piecesInStart++;
                        currentBoard[p].piecesInPlay--;
                    }
                }
            }
        }
        returnMove();
    }
}

function updateBoard(gameBoard) {


    if (typeof gameBoard != 'undefined') {

        drawBoard();
        currentBoard = gameBoard;
        currentBoard.forEach(function (player) {
            //console.log('Drawing Player' + player)
            for (i = 0; i < player.piecesInStart; i++) {
                drawPiece(X_START_LOCATIONS[player.colorIndex][i], Y_START_LOCATIONS[player.colorIndex][i], colors[player.colorIndex]);
            }

            for (i = 0; i < player.piecesInPlay; i++) {

                var x = XLocations[player.pieceLocations[i]]
                var y = YLocations[player.pieceLocations[i]]

                drawPiece(x, y, colors[player.colorIndex]);
            }
        });

    } else {
        console.log('Game Board is Undefined')
    }
}

function showErrorMessage(data) {
    console.log(data.errorCode)
}

function drawBoard() {

    fill(BOARD)
    rect(0, 0, WIDTH, WIDTH);
    drawStartPostitions();
    drawHomeCells();
}

function drawStartPostitions() {
    strokeWeight(STORKE_WIDTH);
    stroke(STROKE);
    fill(BLACK);

    for (i = 0; i < NUM_CELLS + 1; i++) {

        var line_offset = (i * (CELL_WIDTH + STORKE_WIDTH)) + STORKE_WIDTH / 2;

        line(line_offset, 0, line_offset, WIDTH);
        line(0, line_offset, WIDTH, line_offset);
    }


    var HOME_WIDTH = (CELL_WIDTH * 6) + (STORKE_WIDTH * 5);
    var TRI_START = (CELL_WIDTH * 6) + (STORKE_WIDTH * 7);
    var TRI_WIDTH = (CELL_WIDTH * 3) + (STORKE_WIDTH * 3);


    fill(GREEN);
    rect(STORKE_WIDTH, STORKE_WIDTH, HOME_WIDTH, HOME_WIDTH);
    triangle(TRI_START, TRI_START,
        WIDTH / 2, WIDTH / 2,
        TRI_START, TRI_START + TRI_WIDTH);

    fill(RED);
    rect(STORKE_WIDTH, WIDTH - STORKE_WIDTH - HOME_WIDTH, HOME_WIDTH, HOME_WIDTH);
    triangle(TRI_START, TRI_START + TRI_WIDTH,
        WIDTH / 2, WIDTH / 2,
        TRI_START + TRI_WIDTH, TRI_START + TRI_WIDTH);

    fill(YELLOW);
    rect(WIDTH - STORKE_WIDTH - HOME_WIDTH, STORKE_WIDTH, HOME_WIDTH, HOME_WIDTH);
    triangle(TRI_START, TRI_START,
        WIDTH / 2, WIDTH / 2,
        TRI_START + TRI_WIDTH, TRI_START);

    fill(BLUE);
    rect(WIDTH - STORKE_WIDTH - HOME_WIDTH, WIDTH - STORKE_WIDTH - HOME_WIDTH, HOME_WIDTH, HOME_WIDTH);
    triangle(TRI_START + TRI_WIDTH, TRI_START,
        WIDTH / 2, WIDTH / 2,
        TRI_START + TRI_WIDTH, TRI_START + TRI_WIDTH);


    fillInnerHome(1, 1);
    fillInnerHome(1, 10);
    fillInnerHome(10, 1);
    fillInnerHome(10, 10);
}

function drawHomeCells() {
    fillCell(1, 6, GREEN);
    fillCell(1, 7, GREEN);
    fillCell(2, 7, GREEN);
    fillCell(3, 7, GREEN);
    fillCell(4, 7, GREEN);
    fillCell(5, 7, GREEN);

    fillCell(6, 13, RED);
    fillCell(7, 13, RED);
    fillCell(7, 12, RED);
    fillCell(7, 11, RED);
    fillCell(7, 10, RED);
    fillCell(7, 9, RED);

    fillCell(8, 1, YELLOW);
    fillCell(7, 1, YELLOW);
    fillCell(7, 2, YELLOW);
    fillCell(7, 3, YELLOW);
    fillCell(7, 4, YELLOW);
    fillCell(7, 5, YELLOW);

    fillCell(13, 8, BLUE);
    fillCell(13, 7, BLUE);
    fillCell(12, 7, BLUE);
    fillCell(11, 7, BLUE);
    fillCell(10, 7, BLUE);
    fillCell(9, 7, BLUE);
}

function fillInnerHome(x, y) {
    fill(WHITE);
    var HOME_INNER_WIDTH = (CELL_WIDTH * 4) + (STORKE_WIDTH * 3);
    rect((x * CELL_WIDTH) + ((x + 1) * STORKE_WIDTH), (y * CELL_WIDTH) + ((y + 1) * STORKE_WIDTH),
        HOME_INNER_WIDTH,
        HOME_INNER_WIDTH);

}

function fillCell(x, y, color) {
    noStroke();
    fill(color);
    rect((x * CELL_WIDTH) + ((x + 1) * STORKE_WIDTH), (y * CELL_WIDTH) + ((y + 1) * STORKE_WIDTH),
        CELL_WIDTH,
        CELL_WIDTH);
}

function drawPiece(x, y, color) {
    strokeWeight(STORKE_WIDTH);
    stroke(STROKE);
    fill(color);
    ellipse((x * CELL_WIDTH) + ((x + 1) * STORKE_WIDTH) + CELL_WIDTH / 2, (y * CELL_WIDTH) + ((y + 1) * STORKE_WIDTH) + CELL_WIDTH / 2,
        CELL_WIDTH - (STORKE_WIDTH * 4));
}

function buildmap() {
    for (i = 0; i < XLocations.length; i++) {
        var t = XLocations[i] + ',' + YLocations[i]
        mapXYtoPos[t] = i;
    }

    for (i = 0; i < 4; i++) {
        var temp = {}
        for (j = 0; j < 4; j++) {
            temp[X_START_LOCATIONS[i][j] + ',' + Y_START_LOCATIONS[i][j]] = true;
        }
        mapStartXYtoPos.push(temp);
    }
}

function XYtoLocation(x, y) {
    return mapXYtoPos[x + ',' + y]
}

$(document).ready(function () {

});