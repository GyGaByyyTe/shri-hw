export interface ICanvas {
  node: HTMLCanvasElement;
  index: number;
}

export const ANIMATION_TIME = 300;

export const sources = [
  "http://live-bumtv.cdnvideo.ru/bumtv-live/smil:bumtv.smil/chunklist_b4192000.m3u8", // Бум ТВ
  "http://highvolume03.streampartner.nl:1935/vleugels_hd4/livestream/playlist.m3u8", // X-ite TV
  "http://193.124.177.175:8081/live-x/t2x2/playlist.m3u8",
  "http://hls-edge.cdn.buy-home.tv/bhtvlive/_definst_/live/playlist.m3u8" //
];
