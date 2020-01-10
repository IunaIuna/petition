console.log("Canvas.js");
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
let dot = document.getElementById("dot");

canvas.addEventListener("mousemove", function(event) {
    console.log("mousemove happened");
    console.log(event);
    dot.style.left = event.pageX - 2 + "px";
    dot.style.top = event.pageY - 2 + "px";
    canvas.addEventListener("mousedown", function(event) {
        console.log("mousedown happened");
        ctx.strokeStyle = "black";
        ctx.linewidth = 5;
        ctx.beginPath();
        ctx.stroke();
        ctx.moveTo(dot.style.left, dot.style.top);
    });
});
