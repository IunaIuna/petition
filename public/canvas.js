console.log("Canvas.js");
var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");
var signatureInput = document.querySelector("#signatureInput");

ctx.lineWidth = 5;
ctx.lineCap = "round";
ctx.strokeStyle = "midnightblue";

let painting = false;

function startPosition(e) {
    painting = true;
    //draw(e) here too, so we can also write dots with mousedown
    ctx.moveTo(e.offsetX, e.offsetY);
    draw(e);
}

function finishedPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    // let rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

//MOUSECLICK DOWN
canvas.addEventListener("mousedown", function(event) {
    // console.log("clientX: ", event.offsetX);
    // console.log("clientY: ", event.offsetY);
    // console.log(event);
    // console.log("mousedown happened");
    startPosition(event);
});

//MOUSE MOVES
canvas.addEventListener("mousemove", function(event) {
    // console.log(event);
    // console.log("mousemove happened");
    draw(event);
});

//MOUSE MOVES
canvas.addEventListener("mouseup", function(event) {
    console.log(event);
    console.log("mouseup happened");
    finishedPosition();
    var imageData = canvas.toDataURL();
    signatureInput.value = imageData;
});
