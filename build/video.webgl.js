const videoInit = () => {
  var v = document.getElementById("video1");
  var canvas = document.getElementById("canvas-for-video");
  var context = canvas.getContext("2d");

  var cw = Math.floor(canvas.clientWidth / 100);
  var ch = Math.floor(canvas.clientHeight / 100);
  canvas.width = cw;
  canvas.height = ch;

  v.addEventListener(
    "play",
    function() {
      draw(this, context, cw, ch);
    },
    false
  );
};
document.addEventListener(
  "DOMContentLoaded",
  () => {
    videoInit();
  },
  false
);
