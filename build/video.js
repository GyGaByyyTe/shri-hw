const videoInit = () => {
  const createPlayer = (element, source) => {
    if (Hls.isSupported()) {
      var hls = new Hls();
      // bind them together
      hls.attachMedia(element);
      // MEDIA_ATTACHED event is fired by hls object once MediaSource is ready
      hls.on(Hls.Events.MEDIA_ATTACHED, function() {
        console.log("video and hls.js are now bound together !");
        hls.loadSource(source);
        hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
          console.log(
            "manifest loaded, found " + data.levels.length + " quality level"
          );
          video.play();
        });
      });
    }
  };

  const video1 = document.querySelector("#video1");
  const sources = [
    "http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8",
    "",
    "",
    ""
  ];
  createPlayer(video1, sources[0]);
};
document.addEventListener(
  "DOMContentLoaded",
  () => {
    videoInit();
  },
  false
);
