const ANIMATION_TIME = 300;

const videoInit = () => {
  const videoArray = document.querySelectorAll(".multimedia__video");
  const canvasArray = document.querySelectorAll(".multimedia__canvas");
  const inputBright = document.querySelector("#bright");
  const spanBright = document.querySelector(".multimedia__bright");
  const inputContrast = document.querySelector("#contrast");
  const spanContrast = document.querySelector(".multimedia__contrast");
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 512;

  let appState = {
    isFullScreen: false,
    canvasObjects: {},
    canvasBackObjects: {}
  };
  canvasArray.forEach((c, i) => {
    const back = document.createElement("canvas");
    back.classList.add("multimedia__canvas-back");
    c.parentNode.insertBefore(back, null);

    appState.canvasObjects[i] = {
      canvas: c,
      fullScreen: false
    };
    appState.canvasBackObjects[i] = {
      canvas: back,
      fullScreen: false
    };
  });
  console.log(appState);

  const blocks = document.querySelectorAll("button");
  blocks.forEach((item, index) => {
    item.addEventListener("click", event => {
      event.preventDefault();
      videoArray[index].play();
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

  const createPlayer = (video, canvas, source) => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(source);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          hls.currentLevel = hls.startLevel;
          video.play();
          bindVideoCanvas(video, canvas);
        });
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            // hls.destroy();
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", function() {
        video.play();
        // var video = videojs(video.id);
        bindVideoCanvas(video, canvas);
      });
    }
  };

  const bindVideoCanvas = (video, canvas) => {
    const { node, index } = canvas;
    const context = node.getContext("2d");
    const cBack = appState.canvasBackObjects[index].canvas.getContext("2d");
    const cw = 480;
    const ch = 360;
    node.width = cw;
    node.height = ch;
    appState.canvasBackObjects[index].canvas.width = cw;
    appState.canvasBackObjects[index].canvas.height = ch;
    const playerWidth = node.parentNode.clientWidth;
    const playerHeight = node.parentNode.clientHeight;
    videoListHeight = playerHeight * 2 + 5;

    function draw(v, c, bc, w, h, index) {
      if (v.ended) return false;
      if (appState.isFullScreen) {
        if (appState.canvasObjects[index].fullScreen) {
          v.muted = false;
          const newBright = `${parseInt(inputBright.value) + 100}%`;
          const newContrast = `${parseInt(inputContrast.value) + 100}%`;
          spanBright.innerText = newBright;
          spanContrast.innerText = newContrast;
          c.filter = `brightness(${newBright}) contrast(${newContrast})`;
          c.drawImage(v, 0, 0, w, h);
        } else {
          // v.pause();
          v.muted = true;
        }
      } else {
        // if (v.paused) {
        //   v.play();
        // }
        v.muted = true;
        c.filter = "none";
        c.drawImage(v, 0, 0, w, h);
      }
      requestAnimationFrame(() => {
        draw(v, c, bc, w, h, index);
      });
    }

    video.addEventListener(
      "play",
      () => {
        draw(video, context, cBack, cw, ch, index);
      },
      false
    );

    node.addEventListener("click", event => {
      event.preventDefault();
      if (Math.abs(videoListWidth - node.parentNode.clientWidth) > 10) {
        node.parentNode.classList.add("multimedia__video-frame--full");
        const animation = node.parentNode.animate(
          [
            { width: `${playerWidth}px`, height: `${playerHeight}px` },
            { width: `${videoListWidth}px`, height: `${videoListHeight}px` }
          ],
          {
            duration: ANIMATION_TIME
          }
        );
        animation.onfinish = () => {
          node.parentNode.style.width = `${videoListWidth}px`;
          node.parentNode.style.height = `${videoListHeight}px`;
          blocks[index].innerText = `${node.parentNode.style.width}
						${node.parentNode.style.height}`;

          let cObject = {
            ...appState.canvasObjects,
            [index]: {
              ...appState.canvasObjects[index],
              fullScreen: true
            }
          };
          appState = {
            ...appState,
            isFullScreen: true,
            canvasObjects: cObject
          };
        };
      } else {
        const animation = node.parentNode.animate(
          [
            { width: `${videoListWidth}px`, height: `${videoListHeight}px` },
            { width: `${playerWidth}px`, height: `${playerHeight}px` }
          ],
          {
            duration: ANIMATION_TIME
          }
        );
        let cObject = {
          ...appState.canvasObjects,
          [index]: {
            ...appState.canvasObjects[index],
            fullScreen: false
          }
        };
        appState = {
          ...appState,
          isFullScreen: false,
          canvasObjects: cObject
        };
        animation.onfinish = () => {
          node.parentNode.classList.remove("multimedia__video-frame--full");
          // node.parentNode.style = "width:auto; height: auto;";
          node.parentNode.style.width = `${playerWidth}px`;
          node.parentNode.style.height = `${playerHeight}px`;
          blocks[index].innerText = `${node.parentNode.style.width}
						${node.parentNode.style.height}`;
        };
      }
    });
  };
  for (let i = 0; i < 4; i++) {
    createPlayer(videoArray[i], { node: canvasArray[i], index: i }, sources[i]);
  }
};
document.addEventListener(
  "DOMContentLoaded",
  () => {
    videoInit();
  },
  false
);
