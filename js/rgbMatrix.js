var selectedColor = [255, 0, 100];
var pixels = [];

function setup() {
    pixels = [];
    canvas = createCanvas(640,640);
    background(0,0,0);
    for(count = 0; count < 1024; count++){
        pixels.push([0,0,0])
    }
         
}
function draw(){
    
}

function mouseDragged() { 
    drawPixel();
}

function mouseClicked() {
    drawPixel();
}
function mousePressed() {
    drawPixel();
}
function mouseReleased(){
    
}

function touchStarted() {
    drawPixel();
}
function touchMoved() {
    drawPixel();
}

function drawPixel(){
    noStroke();
    fill(selectedColor[0], selectedColor[1], selectedColor[2]);
    var xloc = mouseX - (mouseX%20);
    var yloc = mouseY - (mouseY%20);
    var x = xloc/20;
    var y = yloc/20;
    
    if(x>=0 && x<32 && y>=0 && y<32){
        rect(xloc, yloc, 20, 20)
        pixels[(y*32) + x] = selectedColor;
        console.log(x + " , " + y);
    }
}


$( document ).ready(function() {
    $("button").click(function(){
        console.log("test");
        $.post("/sendFile", { 'pixels': JSON.stringify(pixels) } );
    });
});