import { PointerController } from "./pointer/PointerController";

export function pointerEventsInit() {
  const theZoom: HTMLSpanElement | null = document.querySelector(
    "#camera-zoom"
  );
  const theBrightness: HTMLSpanElement | null = document.querySelector(
    "#camera-brightness"
  );
  const theLocationPointer: HTMLDivElement | null = document.querySelector(
    "#camera-pointer"
  );
  const theImage: HTMLImageElement | null = document.querySelector(
    "#main-image"
  );
  const theViewer: HTMLDivElement | null = document.querySelector(
    "#main-viewer"
  );

  if (theViewer && theImage && theZoom && theBrightness && theLocationPointer) {
    //igore touch-events upon the element
    let blockMenuHeaderScroll: boolean = false;
    window.addEventListener("touchstart", (e: TouchEvent) => {
      if (e.target === theImage) {
        blockMenuHeaderScroll = true;
      }
    });
    window.addEventListener("touchend", () => {
      blockMenuHeaderScroll = false;
    });
    window.addEventListener("touchmove", (e: TouchEvent) => {
      if (blockMenuHeaderScroll) e.preventDefault();
    });

    const pc = new PointerController(
      theZoom,
      theBrightness,
      theLocationPointer,
      theImage,
      theViewer
    );

    pc.init();
  }
}
