var canvas;
var socket = io('http://www.avdheshgarodia.com', { path: '/myapp/socket.io'});


function setup() {
    canvas = createCanvas(windowWidth,windowHeight);
    background(51);
    
    socket.on('mouse', newDrawing)
}

function newDrawing(data){
    noStroke();
    fill(255, 0, 100);
    ellipse(data.x,data.y,36,36);
}

function mouseDragged() {
    
    
    var data = {
        x: mouseX,
        y: mouseY
    }
    
    socket.emit('mouse', data);
    
    noStroke();
    fill(255);
    ellipse(mouseX,mouseY,36,36);
}


function draw() {

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}