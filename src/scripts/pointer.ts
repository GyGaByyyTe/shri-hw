interface iCurrentGesture {
  [key: number]: {
    isPrimary: boolean;
    start: { x: number; y: number };
    prev: { x: number; y: number };
    prevTs: number;
    startPosition: {
      x: number;
      y: number;
    };
  };
}

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const theZoom = document.querySelector("#camera-zoom") as HTMLSpanElement;
    const theBrightness = document.querySelector(
      "#camera-brightness"
    ) as HTMLSpanElement;
    const theLocationPointer = document.querySelector(
      "#camera-pointer"
    ) as HTMLDivElement;

    const theImage = document.querySelector("#main-image") as HTMLImageElement;
    const theViewer = document.querySelector("#main-viewer") as HTMLDivElement;

    //igore touch-events upon the element
    let blockMenuHeaderScroll: boolean = false;
    window.addEventListener("touchstart", e => {
      if (e.target === theImage) {
        blockMenuHeaderScroll = true;
      }
    });
    window.addEventListener("touchend", () => {
      blockMenuHeaderScroll = false;
    });
    window.addEventListener("touchmove", e => {
      if (blockMenuHeaderScroll) {
        e.preventDefault();
      }
    });

    function addPointerHandle(element: HTMLElement) {
      const MAX_SCALE = 3;
      const MAX_BRIGHTNESS = 1;
      let currentGesture: iCurrentGesture = {};

      const nodeState = {
        moving: false,
        scaling: false,
        rotating: false,
        startPosition: { x: 0, y: 0 },
        scale: 3,
        brightness: 0.5,
        prevDist: 0,
        prevRotate: 0,
        imageWidth: theImage.getBoundingClientRect().width,
        imageHeight: theImage.getBoundingClientRect().height
      };
      //initial styles for Image
      theImage.style.transform = `scale(${nodeState.scale},${nodeState.scale})`;
      theImage.style.filter = `brightness(${nodeState.brightness})`;
      //initial styles for View Components
      theLocationPointer.style.transform = `translate(-50%,-50%) scale(${MAX_SCALE /
        nodeState.scale},${3 / nodeState.scale})`;
      //смещение по X в %
      let dxLocation =
        nodeState.startPosition.x /
        (nodeState.imageWidth / 100) /
        nodeState.scale;
      theLocationPointer.style.left = `${50 - dxLocation}%`;
      //смещение по Y в %
      let dyLocation =
        nodeState.startPosition.y /
        (nodeState.imageHeight / 100) /
        nodeState.scale;
      theLocationPointer.style.top = `${50 - dyLocation}%`;

      theZoom.innerText = nodeState.scale.toFixed(1);
      let countedBrightness: number = nodeState.brightness * 100;
      theBrightness.innerText = countedBrightness.toFixed(2) + "%";

      element.addEventListener("pointerdown", event => {
        // Нужно для десктопа чтобы поймать pointerup вне DOM-ноды
        // element.setPointerCapture(event.pointerId);

        currentGesture[event.pointerId] = {
          isPrimary: event.isPrimary,
          start: { x: event.x, y: event.y },
          prev: { x: event.x, y: event.y },
          prevTs: Date.now(),
          startPosition: {
            x: nodeState.startPosition.x,
            y: nodeState.startPosition.y
          }
        };

        if (Object.keys(currentGesture).length === 1) {
          nodeState.moving = true;
          //   touchStart(event);
        } else if (Object.keys(currentGesture).length === 2) {
          nodeState.moving = false;
          nodeState.scaling = true;
          nodeState.rotating = true;
          //   pinchStart(event);
          //   rotationStart(event);
        }
      });
      element.addEventListener("pointermove", event => {
        if (Object.keys(currentGesture).length == 0) {
          return;
        }

        if (nodeState.moving) {
          touchMove(event);
        }
        if (nodeState.scaling) {
          pinchMove(event);
        }
        if (nodeState.rotating) {
          rotationMove(event);
        }
      });

      function touchMove(event: PointerEvent) {
        const { start, startPosition } = currentGesture[event.pointerId];
        const { x, y } = event;
        const dx = x - start.x;
        const dy = y - start.y;

        theImage.style.left = startPosition.x + dx + "px";
        theImage.style.top = startPosition.y + dy + "px";
        currentGesture[event.pointerId].prev = { x: x, y: y };
        nodeState.startPosition = {
          x: startPosition.x + dx,
          y: startPosition.y + dy
        };
        let dxLocation =
          (0 + nodeState.startPosition.x) /
          (nodeState.imageWidth / 100) /
          nodeState.scale;
        let dyLocation =
          (0 + nodeState.startPosition.y) /
          (nodeState.imageHeight / 100) /
          nodeState.scale;
        theLocationPointer.style.left = `${50 - dxLocation}%`;
        theLocationPointer.style.top = `${50 - dyLocation}%`;
      }

      function pinchMove(event: PointerEvent) {
        const prev = [];
        const { x, y } = event;
        const { prevDist } = nodeState;
        let index: string;
        for (index in currentGesture) {
          prev.push({
            x: currentGesture[index].prev.x,
            y: currentGesture[index].prev.y
          });
        }

        var dist = Math.sqrt(
          (prev[0].x - prev[1].x) * (prev[0].x - prev[1].x) +
            (prev[0].y - prev[1].y) * (prev[0].y - prev[1].y)
        );
        let k = 1;
        if (dist > prevDist) {
          k = 1.01;
        } else if (dist < prevDist) {
          k = 0.99;
        }
        let newScale = k * nodeState.scale;
        if (newScale > MAX_SCALE) {
          newScale = MAX_SCALE;
        }
        if (newScale <= 1) {
          newScale = 1;
        }

        nodeState.scale = newScale;
        nodeState.prevDist = dist;
        nodeState.imageWidth = theImage.getBoundingClientRect().width;
        nodeState.imageHeight = theImage.getBoundingClientRect().height;
        theZoom.innerText = nodeState.scale.toFixed(1);
        theLocationPointer.style.transform = `translate(-50%,-50%) scale(${MAX_SCALE /
          nodeState.scale},${3 / nodeState.scale})`;

        theImage.style.transform = `scale(${newScale},${newScale})`;

        currentGesture[event.pointerId].prev = { x: x, y: y };
      }

      function rotationMove(event: PointerEvent) {
        const prev = [];
        const { x, y } = event;
        const { prevRotate } = nodeState;
        let index: string;
        for (index in currentGesture) {
          prev.push({
            x: currentGesture[index].prev.x,
            y: currentGesture[index].prev.y
          });
        }
        var rotate = Math.atan(
          (prev[1].y - prev[0].y) / (prev[1].x - prev[0].x)
        );
        if (Math.abs(rotate - prevRotate) > 3) {
          rotate = rotate - Math.PI;
        }

        let k = 1;
        if (rotate > prevRotate) {
          k = 1.03;
        } else if (rotate < prevRotate) {
          k = 0.97;
        }
        let newBrightness = k * nodeState.brightness;
        if (newBrightness > MAX_BRIGHTNESS) {
          newBrightness = MAX_BRIGHTNESS;
        }
        if (newBrightness <= 0) {
          newBrightness = 0;
        }

        nodeState.brightness = newBrightness;
        nodeState.prevRotate = rotate;
        let countedBrightness = nodeState.brightness * 100;
        theBrightness.innerText = countedBrightness.toFixed(2) + "%";

        theImage.style.filter = `brightness(${nodeState.brightness})`;

        currentGesture[event.pointerId].prev = { x: x, y: y };
      }

      function touchStopHandle(event: PointerEvent) {
        if (Object.keys(currentGesture).length < 1) {
          return;
        }

        if (nodeState.moving) {
          //   touchEnd(e);
          nodeState.moving = false;
        }
        if (nodeState.scaling) {
          //   pinchEnd(e);
          nodeState.scaling = false;
        }
        if (nodeState.rotating) {
          //   rotationEnd(e);
          nodeState.rotating = false;
        }
        delete currentGesture[event.pointerId];
      }
      element.addEventListener("pointerup", touchStopHandle);
      element.addEventListener("pointercancel", touchStopHandle);
    }
    addPointerHandle(theViewer);
  },
  false
);
