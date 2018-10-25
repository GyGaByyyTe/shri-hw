import * as help from "./pointerHelpers";

export class PointerController {
  theZoom: HTMLSpanElement;
  theBrightness: HTMLSpanElement;
  theLocationPointer: HTMLDivElement;
  theImage: HTMLImageElement;
  mainElement: HTMLDivElement;

  currentGesture: help.iCurrentGesture;
  nodeState: help.iNodeState;

  constructor(
    elemZoom: HTMLSpanElement,
    elemBrightness: HTMLSpanElement,
    elemLocationPointer: HTMLDivElement,
    elemImage: HTMLImageElement,
    elemViewer: HTMLDivElement
  ) {
    this.theZoom = elemZoom;
    this.theBrightness = elemBrightness;
    this.theLocationPointer = elemLocationPointer;
    this.theImage = elemImage;
    this.mainElement = elemViewer;

    this.currentGesture = {};
    this.nodeState = {
      moving: false,
      scaling: false,
      rotating: false,
      startPosition: { x: 0, y: 0 },
      scale: 3,
      brightness: 0.5,
      prevDist: 0,
      prevRotate: 0,
      imageWidth: this.theImage.getBoundingClientRect().width,
      imageHeight: this.theImage.getBoundingClientRect().height
    };
  }

  init() {
    this.addPointerHandle(this.mainElement);
  }

  private addPointerHandle(element: HTMLElement) {
    //initial styles for Image
    this.theImage.style.transform =
      `scale(${this.nodeState.scale},` + `${this.nodeState.scale})`;
    this.theImage.style.filter = `brightness(${this.nodeState.brightness})`;

    this.theLocationPointer.style.transform =
      `translate(-50%,-50%) ` +
      `scale(${help.MAX_SCALE / this.nodeState.scale},${help.MAX_SCALE /
        this.nodeState.scale})`;
    //смещение по X и Y в %
    let dxLocation = 50 - help.getLinearDelta(this.nodeState).dx;
    let dyLocation = 50 - help.getLinearDelta(this.nodeState).dy;

    this.theLocationPointer.style.left = `${dxLocation}%`;
    this.theLocationPointer.style.top = `${dyLocation}%`;

    this.theZoom.innerText = this.nodeState.scale.toFixed(1);

    this.theBrightness.innerText = help.renderBrightness(this.nodeState);

    element.addEventListener("pointerdown", event => {
      this.currentGesture[event.pointerId] = {
        isPrimary: event.isPrimary,
        start: { x: event.x, y: event.y },
        prev: { x: event.x, y: event.y },
        prevTs: Date.now(),
        startPosition: {
          x: this.nodeState.startPosition.x,
          y: this.nodeState.startPosition.y
        }
      };

      if (Object.keys(this.currentGesture).length === 1) {
        this.nodeState.moving = true;
      } else if (Object.keys(this.currentGesture).length === 2) {
        this.nodeState.moving = false;
        this.nodeState.scaling = true;
        this.nodeState.rotating = true;
      }
    });
    element.addEventListener("pointermove", event => {
      if (Object.keys(this.currentGesture).length == 0) return;

      if (this.nodeState.moving) {
        this.touchMove(event);
      }
      if (this.nodeState.scaling) {
        this.pinchMove(event);
      }
      if (this.nodeState.rotating) {
        this.rotationMove(event);
      }
    });
    element.addEventListener("pointerup", event => {
      this.touchStopHandler(event);
    });
    element.addEventListener("pointercancel", event => {
      this.touchStopHandler(event);
    });
  }

  touchMove(event: PointerEvent) {
    const { start, startPosition } = this.currentGesture[event.pointerId];
    const { x, y } = event;
    const dx = x - start.x;
    const dy = y - start.y;

    this.theImage.style.left = startPosition.x + dx + "px";
    this.theImage.style.top = startPosition.y + dy + "px";
    this.currentGesture[event.pointerId].prev = { x: x, y: y };
    this.nodeState.startPosition = {
      x: startPosition.x + dx,
      y: startPosition.y + dy
    };
    let dxLocation = 50 - help.getLinearDelta(this.nodeState).dx;
    let dyLocation = 50 - help.getLinearDelta(this.nodeState).dy;

    this.theLocationPointer.style.left = `${dxLocation}%`;
    this.theLocationPointer.style.top = `${dyLocation}%`;
  }

  pinchMove(event: PointerEvent) {
    const { x, y } = event;
    const { prevDist } = this.nodeState;

    const prev = help.getPrevTwoCoords(this.currentGesture);

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
    let newScale = k * this.nodeState.scale;
    if (newScale > help.MAX_SCALE) {
      newScale = help.MAX_SCALE;
    }
    if (newScale <= 1) {
      newScale = 1;
    }

    this.nodeState.scale = newScale;
    this.nodeState.prevDist = dist;
    this.nodeState.imageWidth = this.theImage.getBoundingClientRect().width;
    this.nodeState.imageHeight = this.theImage.getBoundingClientRect().height;
    this.theZoom.innerText = this.nodeState.scale.toFixed(1);
    this.theLocationPointer.style.transform =
      `translate(-50%,-50%)` +
      `scale(${help.MAX_SCALE / this.nodeState.scale},${help.MAX_SCALE /
        this.nodeState.scale})`;

    this.theImage.style.transform = `scale(${newScale},${newScale})`;

    this.currentGesture[event.pointerId].prev = { x: x, y: y };
  }

  rotationMove(event: PointerEvent) {
    const { x, y } = event;
    const { prevRotate } = this.nodeState;

    const prev = help.getPrevTwoCoords(this.currentGesture);

    var rotate = Math.atan((prev[1].y - prev[0].y) / (prev[1].x - prev[0].x));
    if (Math.abs(rotate - prevRotate) > 3) {
      rotate = rotate - Math.PI;
    }

    let k = 1;
    if (rotate > prevRotate) {
      k = 1.03;
    } else if (rotate < prevRotate) {
      k = 0.97;
    }
    let newBrightness = k * this.nodeState.brightness;
    if (newBrightness > help.MAX_BRIGHTNESS) {
      newBrightness = help.MAX_BRIGHTNESS;
    }
    if (newBrightness <= 0) {
      newBrightness = 0;
    }

    this.nodeState.brightness = newBrightness;
    this.nodeState.prevRotate = rotate;

    this.theBrightness.innerText = help.renderBrightness(this.nodeState);

    this.theImage.style.filter = `brightness(${this.nodeState.brightness})`;

    this.currentGesture[event.pointerId].prev = { x: x, y: y };
  }

  touchStopHandler(event: PointerEvent) {
    if (Object.keys(this.currentGesture).length < 1) return;

    if (this.nodeState.moving) this.nodeState.moving = false;
    if (this.nodeState.scaling) this.nodeState.scaling = false;
    if (this.nodeState.rotating) this.nodeState.rotating = false;

    delete this.currentGesture[event.pointerId];
  }
}
