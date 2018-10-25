const ANIMATION_TIME = 300;
//@ts-ignore
export function videoInit() {
  const blocks = document.querySelectorAll("button");
  const videoArray = document.querySelectorAll(".multimedia__video");
  const canvasArray = document.querySelectorAll(".multimedia__canvas");
  const inputBright = document.querySelector("#bright");
  const spanBright = document.querySelector(".multimedia__bright");
  const inputContrast = document.querySelector("#contrast");
  const spanContrast = document.querySelector(".multimedia__contrast");

  //контейнер с видео
	const videoList = document.querySelector(".multimedia__list");
	//@ts-ignore
  let videoListWidth = parseInt(videoList.clientWidth.toString());
  //@ts-ignore
  let videoListHeight;

  //volume meter
  //@ts-ignore
  const ctx = document.querySelector("#meter").getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 300, 0);
  gradient.addColorStop(1, "#000000");
  gradient.addColorStop(0.75, "#ff0000");
  gradient.addColorStop(0.25, "#ffff00");
  gradient.addColorStop(0, "#ffffff");
  //@ts-ignore
  if (!window.AudioContext) {
    //@ts-ignore
    if (!window.webkitAudioContext) {
      alert("no audiocontext found");
    }
    //@ts-ignore
    window.AudioContext = window.webkitAudioContext;
  }
  const audioContext = new AudioContext();
  //сюда запоминаю элемент, созданный через createMediaElementSource
  //потому что удалять его не получается при смене источника аудио
  //@ts-ignore
  let audioSourceNodes = { 0: null, 1: null, 2: null, 3: null };

  const analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = 0.3;
  analyser.fftSize = 1024;
  const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
  javascriptNode.onaudioprocess = function() {
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    const average = getAverageVolume(array);
    ctx.clearRect(0, 0, 500, 50);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2 * average, 50);
  };
  //@ts-ignore
  function getAverageVolume(array) {
    let values = 0;
    let average;
    const length = array.length;
    for (var i = 0; i < length; i++) {
      values += array[i];
    }
    average = values / length;
    return average;
  }
  javascriptNode.connect(audioContext.destination);
  analyser.connect(javascriptNode);
  //@ts-ignore
  function setupAudioNodes(video, index) {
    //@ts-ignore
    if (!audioSourceNodes[index]) {
      //@ts-ignore
      audioSourceNodes[index] = audioContext.createMediaElementSource(video);
    }
    //@ts-ignore
    audioSourceNodes[index].connect(analyser);
    //@ts-ignore
    audioSourceNodes[index].connect(audioContext.destination);
  }

  //application State
  let appState = {
    isFullScreen: false,
    canvasObjects: {}
  };
  canvasArray.forEach((c, i) => {
    //@ts-ignore
    appState.canvasObjects[i] = {
      canvas: c,
      fullScreen: false
    };
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
  //@ts-ignore
  const createPlayer = (video, canvas, source) => {
    //@ts-ignore
    if (Hls.isSupported()) {
      //@ts-ignore
      const hls = new Hls();
      hls.attachMedia(video);
      //@ts-ignore
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(source);
        //@ts-ignore
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          video.play().catch(() => {
            // на андроиде видео не запускалось автоматически, показываю кнопку
            blocks[canvas.index].style.display = "inline-block";
            blocks[canvas.index].innerText = `Play ${canvas.index + 1} видео`;
            blocks[canvas.index].addEventListener("click", event => {
              event.preventDefault();
              video.play().then(() => {
                //@ts-ignore
                blocks[canvas.index].disabled = "disabled";
                blocks[canvas.index].innerText = `Played ${canvas.index + 1}`;
              });
            });
          });
          bindVideoCanvas(video, canvas);
        });
      });
      //@ts-ignore
      hls.on(Hls.Events.ERROR, function(event, data) {
        switch (data.type) {
          //@ts-ignore
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          //@ts-ignore
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", function() {
        video.play();
        //@ts-ignore
        var video = videojs(video.id);
        bindVideoCanvas(video, canvas);
      });
    }
  };
  //@ts-ignore
  const bindVideoCanvas = (video, canvas) => {
    const { node, index } = canvas;
    const context = node.getContext("2d");
    const cw = 480; //магические числа самого низкого разрешения видео
    const ch = 360;
    node.width = cw;
    node.height = ch;
    const playerWidth = node.parentNode.clientWidth;
    const playerHeight = node.parentNode.clientHeight;
    videoListHeight = playerHeight * 2 + 5;
    //@ts-ignore
    function draw(v, c, w, h, index) {
      if (v.paused || v.ended) return false;
      if (appState.isFullScreen) {
        //@ts-ignore
        if (appState.canvasObjects[index].fullScreen) {
          v.muted = false;
          //@ts-ignore
          const newBright = `${parseInt(inputBright.value) + 100}%`;
          //@ts-ignore
          const newContrast = `${parseInt(inputContrast.value) + 100}%`;
          //@ts-ignore
          spanBright.innerText = newBright;
          //@ts-ignore
          spanContrast.innerText = newContrast;
          c.filter = `brightness(${newBright}) contrast(${newContrast})`;
          c.drawImage(v, 0, 0, w, h);
        } else {
          v.muted = true;
        }
      } else {
        v.muted = true;
        c.filter = "none";
        c.drawImage(v, 0, 0, w, h);
      }
      requestAnimationFrame(() => {
        draw(v, c, w, h, index);
      });
    }

    video.addEventListener(
      "play",
      () => {
        draw(video, context, cw, ch, index);
      },
      false
    );
    //@ts-ignore
    node.addEventListener("click", event => {
      event.preventDefault();
      if (Math.abs(videoListWidth - node.parentNode.clientWidth) > 10) {
        node.parentNode.classList.add("multimedia__video-frame--full");

        const animation = node.parentNode.animate(
          [
            { width: `${playerWidth}px`, height: `${playerHeight}px` },
            //@ts-ignore
            { width: `${videoListWidth}px`, height: `${videoListHeight}px` }
          ],
          {
            duration: ANIMATION_TIME
          }
        );
        animation.onfinish = () => {
          setupAudioNodes(videoArray[index], index);

          node.parentNode.style.width = `${videoListWidth}px`;
          //@ts-ignore
          node.parentNode.style.height = `${videoListHeight}px`;

          let cObject = {
            ...appState.canvasObjects,
            [index]: {
              //@ts-ignore
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
            //@ts-ignore
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
            //@ts-ignore
            ...appState.canvasObjects[index],
            fullScreen: false
          }
        };
        appState = {
          ...appState,
          isFullScreen: false,
          canvasObjects: cObject
        };
        //@ts-ignore
        audioSourceNodes[index].disconnect();
        animation.onfinish = () => {
          node.parentNode.classList.remove("multimedia__video-frame--full");
          node.parentNode.style.width = `${playerWidth}px`;
          node.parentNode.style.height = `${playerHeight}px`;
        };
      }
    });
  };
  //создаем 4 плеера для потоков
  for (let i = 0; i < 4; i++) {
    createPlayer(videoArray[i], { node: canvasArray[i], index: i }, sources[i]);
  }
}
