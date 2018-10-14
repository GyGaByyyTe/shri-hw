const ANIMATION_TIME = 300;

const videoInit = () => {
  const videoArray = document.querySelectorAll(".multimedia__video");
  const canvasArray = document.querySelectorAll(".multimedia__canvas");

  const blocks = document.querySelectorAll("button");
  blocks.forEach((item, index) => {
    item.addEventListener("click", event => {
      event.preventDefault();
      alert("button click" + videoArray[index].paused);
      videoArray[index]
        .play()
        .then(() => {
          blocks[indexTotal].innerText = "запустил";
          indexTotal++;
        })
        .catch(() => {
          blocks[indexTotal].innerText = "no запустил";
          indexTotal++;
        });
    });
  });

  const sources = [
    // "http://localhost:9191/master?url=http://localhost:3102/streams/sosed/master.m3u8",
    // "http://localhost:9191/master?url=http://localhost:3102/streams/cat/master.m3u8",
    // "http://localhost:9191/master?url=http://localhost:3102/streams/dog/master.m3u8",
    // "http://localhost:9191/master?url=http://localhost:3102/streams/hall/master.m3u8"
    "http://live-bumtv.cdnvideo.ru/bumtv-live/smil:bumtv.smil/chunklist_b4192000.m3u8", // Бум ТВ
    "http://highvolume03.streampartner.nl:1935/vleugels_hd4/livestream/playlist.m3u8", // X-ite TV
    "http://193.124.177.175:8081/live-x/t2x2/playlist.m3u8",
    "http://hls-edge.cdn.buy-home.tv/bhtvlive/_definst_/live/playlist.m3u8" //
  ];

  const videoList = document.querySelector(".multimedia__list");
  let videoListWidth = parseInt(videoList.clientWidth);
  let videoListHeight; // = parseInt(videoList.clientHeight);
  console.log(videoListWidth);

  let indexTotal = 0;
  const createPlayer = (video, canvas, source) => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(source);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log(data);
          hls.currentLevel = hls.startLevel;
          video.play();
          bindVideoCanvas(video, canvas, data);
        });
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error

            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            // console.log("wait for second media");
            // hls.swapAudioCodec();
            hls.recoverMediaError();
            break;
          default:
            // cannot recover
            hls.destroy();
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      // video.addEventListener("loadedmetadata", function() {
      // video
      //   .play()
      //   .then(() => {
      //     alert("запустил");
      //     blocks[indexTotal].innerText = "запустил";
      //     indexTotal++;
      //   })
      //   .catch(() => {
      //     alert("не запустил");
      //     blocks[indexTotal].innerText = "no запустил";
      //     indexTotal++;
      //   });
      // alert("before bindVideoCanvas");
      // var video = videojs(video.id);
      bindVideoCanvas(video, canvas);
      // });
    }
  };

  const bindVideoCanvas = (video, canvas) => {
    const context = canvas.getContext("2d");
    const cw = 480;
    const ch = 360;
    canvas.width = cw;
    canvas.height = ch;
    const playerWidth = canvas.parentNode.clientWidth;
    const playerHeight = canvas.parentNode.clientHeight;
    videoListHeight = playerHeight * 2 + 5;
    console.log(playerHeight);
    function draw(v, c, w, h) {
      if (v.paused || v.ended) return false;
      c.drawImage(v, 0, 0, w, h);
      requestAnimationFrame(() => {
        draw(v, c, w, h);
      });
    }

    video.addEventListener(
      "play",
      () => {
        draw(video, context, cw, ch);
      },
      false
    );

    canvas.addEventListener("click", event => {
      event.preventDefault();
      if (Math.abs(videoListWidth - canvas.parentNode.clientWidth) > 10) {
        canvas.parentNode.classList.toggle("multimedia__video-frame--full");
        const animation = canvas.parentNode.animate(
          [
            { width: `${playerWidth}px`, height: `${playerHeight}px` },
            { width: `${videoListWidth}px`, height: `${videoListHeight}px` }
          ],
          {
            duration: ANIMATION_TIME
          }
        );
        animation.onfinish = () => {
          canvas.parentNode.style.width = `${videoListWidth}px`;
          canvas.parentNode.style.height = `${videoListHeight}px`;
        };
      } else {
        const animation = canvas.parentNode.animate(
          [
            { width: `${videoListWidth}px`, height: `${videoListHeight}px` },
            { width: `${playerWidth}px`, height: `${playerHeight}px` }
          ],
          {
            duration: ANIMATION_TIME
          }
        );
        animation.onfinish = () => {
          canvas.parentNode.classList.toggle("multimedia__video-frame--full");
          canvas.parentNode.style.width = `${playerWidth}px`;
          canvas.parentNode.style.height = `${playerHeight}px`;
        };
      }
    });
  };
  for (let i = 0; i < 4; i++) {
    createPlayer(videoArray[i], canvasArray[i], sources[i]);
  }
};
document.addEventListener(
  "DOMContentLoaded",
  () => {
    videoInit();
  },
  false
);
