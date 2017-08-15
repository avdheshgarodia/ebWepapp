var canvas;
var socket = io(location.href);


var BrushSize = 36;
var BrushColor = [255, 0, 100];
var BackgroundColor = [255, 255, 255];

var gui;

function setup() {
    

    canvas = createCanvas(windowWidth,windowHeight);
    background(BackgroundColor);
    
    gui = createGui('Silly Options');
    sliderRange(1, 200, 1);
    gui.addGlobals('BrushSize','BrushColor');
    
    
    socket.on('mouse', newDrawing)
}

function newDrawing(data){
    noStroke();
    fill(data.brushColor);
    ellipse(data.x, data.y, data.brushSize, data.brushSize);
}

function mouseDragged() {
    drawCircle();
}


function mouseClicked() {
    drawCircle();
}

function drawCircle(){
    
    var data = {
        x: mouseX,
        y: mouseY,
        brushSize: BrushSize,
        brushColor: BrushColor
    }
    
    socket.emit('mouse', data);
    
    noStroke();
    fill(BrushColor);
    ellipse(mouseX,mouseY,BrushSize,BrushSize);
    
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}