import * as help from "./video/videoHelpers";
import { VideoController } from "./video/VideoController";

export function videoInit() {
  const videoArray: Array<HTMLVideoElement> = [].slice.call(
    document.querySelectorAll(".multimedia__video")
  );
  const canvasArray: Array<HTMLCanvasElement> = [].slice.call(
    document.querySelectorAll(".multimedia__canvas")
  );

  const blocks: Array<HTMLButtonElement> = [].slice.call(
    document.querySelectorAll("button")
  );

  const inputBright: HTMLInputElement | null = document.querySelector(
    "#bright"
  );
  const spanBright: HTMLSpanElement | null = document.querySelector(
    ".multimedia__bright"
  );
  const inputContrast: HTMLInputElement | null = document.querySelector(
    "#contrast"
  );
  const spanContrast: HTMLSpanElement | null = document.querySelector(
    ".multimedia__contrast"
  );
  const volumeMeter: HTMLCanvasElement | null = document.querySelector(
    "#meter"
  );
  //контейнер с видео
  const videoList: HTMLDivElement | null = document.querySelector(
    ".multimedia__list"
  );
  if (
    videoArray &&
    canvasArray &&
    blocks &&
    inputBright &&
    spanBright &&
    inputContrast &&
    spanContrast &&
    videoList &&
    volumeMeter
  ) {
    const videoController = new VideoController(
      videoList,
      inputBright,
      spanBright,
      inputContrast,
      spanContrast,
      volumeMeter
    );
    videoController.blocks = blocks;
    videoController.volumeMeter = volumeMeter;
    // videoController.inputBright = inputBright;
    // videoController.spanBright = spanBright;
    for (let i = 0; i < 4; i++) {
      videoController.createPlayer(
        videoArray[i],
        { node: canvasArray[i], index: i },
        help.sources[i]
      );
    }
  }
}
