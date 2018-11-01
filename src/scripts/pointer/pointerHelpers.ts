export const MAX_SCALE = 3;
export const MAX_BRIGHTNESS = 1;

export interface iCurrentGesture {
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
export interface iNodeState {
  moving: boolean;
  scaling: boolean;
  rotating: boolean;
  startPosition: { x: number; y: number };
  scale: number;
  brightness: number;
  prevDist: number;
  prevRotate: number;
  imageWidth: number;
  imageHeight: number;
}

export function getPrevTwoCoords(gesture: iCurrentGesture) {
  let result: Array<{ x: number; y: number }> = [];
  let index: string;
  for (index in gesture) {
    result.push({
      x: gesture[index].prev.x,
      y: gesture[index].prev.y
    });
  }
  return result;
}

export function getLinearDelta(state: iNodeState) {
  let result = { dx: 0, dy: 0 };
  result.dx =
    (0 + state.startPosition.x) / (state.imageWidth / 100) / state.scale;
  result.dy =
    (0 + state.startPosition.y) / (state.imageHeight / 100) / state.scale;
  return result;
}

export function renderBrightness(state: iNodeState) {
  let result: string = "";
  let countedBrightness: number = state.brightness * 100;
  result = countedBrightness.toFixed(2) + "%";
  return result;
}
