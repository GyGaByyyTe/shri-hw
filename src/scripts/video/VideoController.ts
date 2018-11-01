import * as help from "./videoHelpers";
import Hls from "hls.js";

export class VideoController {
  self = this;
  blocks: Array<HTMLButtonElement>;
  videoListWidth: number;
  videoListHeight: number;
  volumeMeter: HTMLCanvasElement;
  inputBright: HTMLInputElement;
  spanBright: HTMLSpanElement;
  inputContrast: HTMLInputElement;
  spanContrast: HTMLSpanElement;

  audioSourceNodes: {
    [key: number]: MediaElementAudioSourceNode | null;
  };
  audioContext: AudioContext;
  analyser: AnalyserNode;

  //application State
  appState: {
    isFullScreen: boolean;
    canvasObjects: {
      [key: number]: {
        canvas: HTMLCanvasElement;
        fullScreen: boolean;
      };
    };
  };

  constructor(
    videoList: HTMLDivElement,
    inputBright: HTMLInputElement,
    spanBright: HTMLSpanElement,
    inputContrast: HTMLInputElement,
    spanContrast: HTMLSpanElement,
    volumeMeter: HTMLCanvasElement
  ) {
    this.blocks = [];
    this.volumeMeter = volumeMeter;
    this.inputBright = inputBright;
    this.spanBright = spanBright;
    this.inputContrast = inputContrast;
    this.spanContrast = spanContrast;
    this.videoListWidth = videoList.clientWidth;
    this.videoListHeight = videoList.clientHeight;
    //сюда запоминаю элемент, созданный через createMediaElementSource
    //потому что удалять его не получается при смене источника аудио
    this.audioSourceNodes = { 0: null, 1: null, 2: null, 3: null };
    this.audioContext = new AudioContext();

    this.analyser = this.audioContext.createAnalyser();

    this.appState = {
      isFullScreen: false,
      canvasObjects: {}
    };

    this.initVolume();
  }
  createPlayer = (
    video: HTMLVideoElement,
    canvas: help.ICanvas,
    source: string
  ) => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(source);
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          video.play().catch(() => {
            let btn = this.blocks[canvas.index];
            // на андроиде видео не запускалось автоматически, показываю кнопку
            btn.style.display = "inline-block";
            btn.innerText = `Play ${canvas.index + 1} видео`;
            btn.addEventListener("click", event => {
              event.preventDefault();
              video.play().then(() => {
                btn.disabled = true;
                btn.innerText = `Played ${canvas.index + 1}`;
              });
            });
          });
          this.bindVideoCanvas(video, canvas);
        });
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
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
      let self = this;
      video.addEventListener("loadedmetadata", function() {
        this.play();
        // var video = videojs(this.id);
        self.bindVideoCanvas(this, canvas);
      });
    }
  };

  initVolume() {
    if (!this.volumeMeter) {
      throw new Error("Can not get volume meter");
    }
    const ctx = this.volumeMeter.getContext("2d");
    if (!ctx) {
      throw new Error("Can not get volume meter context");
    }
    const gradient = ctx.createLinearGradient(0, 0, 300, 0);
    gradient.addColorStop(1, "#000000");
    gradient.addColorStop(0.75, "#ff0000");
    gradient.addColorStop(0.25, "#ffff00");
    gradient.addColorStop(0, "#ffffff");
    if (!AudioContext) {
      throw new Error("No audio context");
    }

    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 1024;
    const javascriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);
    const self = this;
    javascriptNode.onaudioprocess = function() {
      let array = new Uint8Array(self.analyser.frequencyBinCount);
      self.analyser.getByteFrequencyData(array);
      const average = getAverageVolume(array);
      ctx.clearRect(0, 0, 500, 50);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2 * average, 50);
    };

    function getAverageVolume(array: Uint8Array) {
      let values = 0;
      let average;
      const length = array.length;
      for (var i = 0; i < length; i++) {
        values += array[i];
      }
      average = values / length;
      return average;
    }
    javascriptNode.connect(this.audioContext.destination);
    this.analyser.connect(javascriptNode);
  }

  setupAudioNodes(video: HTMLVideoElement, index: number) {
    if (!this.audioContext) return;
    if (!this.audioSourceNodes[index]) {
      this.audioSourceNodes[index] = this.audioContext.createMediaElementSource(
        video
      );
    }
    //@ts-ignore
    this.audioSourceNodes[index].connect(this.analyser);
    //@ts-ignore
    this.audioSourceNodes[index].connect(this.audioContext.destination);
  }

  bindVideoCanvas = (video: HTMLVideoElement, canvas: help.ICanvas) => {
    const { node, index } = canvas;
    this.appState.canvasObjects[index] = {
      canvas: node,
      fullScreen: false
    };

    const context = node.getContext("2d");
    const cw = 480; //магические числа самого низкого разрешения видео
    const ch = 360;
    node.width = cw;
    node.height = ch;
    const playerWidth = node.parentElement ? node.parentElement.clientWidth : 0;
    const playerHeight = node.parentElement
      ? node.parentElement.clientHeight
      : 0;
    this.videoListHeight = playerHeight * 2 + 5;

    let self = this;
    video.addEventListener(
      "play",
      function() {
        self.draw(video, context, cw, ch, index);
      },
      false
    );

    node.addEventListener("click", event => {
      event.preventDefault();
      if (node && node.parentElement) {
        if (
          Math.abs(this.videoListWidth - node.parentElement.clientWidth) > 10
        ) {
          node.parentElement.classList.add("multimedia__video-frame--full");

          const animation = node.parentElement.animate(
            //@ts-ignore
            [
              {
                width: `${playerWidth}px`,
                height: `${playerHeight}px`
              },
              {
                width: `${this.videoListWidth}px`,
                height: `${this.videoListHeight}px`
              }
            ],
            {
              duration: help.ANIMATION_TIME
            }
          );
          animation.onfinish = () => {
            this.setupAudioNodes(video, index);
            if (node && node.parentElement) {
              node.parentElement.style.width = `${this.videoListWidth}px`;
              node.parentElement.style.height = `${this.videoListHeight}px`;
            }

            let cObject = {
              ...this.appState.canvasObjects,
              [index]: {
                ...this.appState.canvasObjects[index],
                fullScreen: true
              }
            };
            this.appState = {
              ...this.appState,
              isFullScreen: true,
              canvasObjects: cObject
            };
          };
        } else {
          const animation = node.parentElement.animate(
            //@ts-ignore
            [
              {
                width: `${this.videoListWidth}px`,
                height: `${this.videoListHeight}px`
              },
              {
                width: `${playerWidth}px`,
                height: `${playerHeight}px`
              }
            ],
            {
              duration: help.ANIMATION_TIME
            }
          );
          let cObject = {
            ...this.appState.canvasObjects,
            [index]: {
              ...this.appState.canvasObjects[index],
              fullScreen: false
            }
          };
          this.appState = {
            ...this.appState,
            isFullScreen: false,
            canvasObjects: cObject
          };
          //@ts-ignore
          this.audioSourceNodes[index].disconnect();
          animation.onfinish = () => {
            if (node && node.parentElement) {
              node.parentElement.classList.remove(
                "multimedia__video-frame--full"
              );
              node.parentElement.style.width = `${playerWidth}px`;
              node.parentElement.style.height = `${playerHeight}px`;
            }
          };
        }
      }
    });
  };

  draw(
    v: HTMLVideoElement,
    c: CanvasRenderingContext2D | null,
    w: number,
    h: number,
    index: number
  ) {
    if (!c) return;
    if (v.paused || v.ended) return false;
    if (this.appState.isFullScreen) {
      if (this.appState.canvasObjects[index].fullScreen) {
        v.muted = false;

        const newBright = `${parseInt(this.inputBright.value) + 100}%`;
        const newContrast = `${parseInt(this.inputContrast.value) + 100}%`;
        this.spanBright.innerText = newBright;
        this.spanContrast.innerText = newContrast;

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
    let self = this;
    requestAnimationFrame(function() {
      self.draw(v, c, w, h, index);
    });
  }
}
