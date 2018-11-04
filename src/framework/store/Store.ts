import * as typing from "../interfaces/index";

export class Store {
  protected signals: { [key: string]: any };
  data: typing.IStoreData;

  constructor(state: typing.IStoreData) {
    this.data = state;
    this.signals = {};
    this.reactivate();
  }

  protected reactivate = () => {
    for (const key in this.data) {
      if (this.data.hasOwnProperty(key)) {
        let val = (<any>this.data)[key];
        Object.defineProperty(this.data, key, {
          get: () => {
            return val;
          },
          set: newVal => {
            val = newVal;
            this.notify(key);
          }
        });
      }
    }
  };

  onChange = (property: string, signalHandler: typing.ISignalCallback) => {
    if (!this.signals[property]) {
      this.signals[property] = [];
    }
    this.signals[property].push(signalHandler);
  };

  protected notify = (signal: string) => {
    if (!this.signals[signal] || this.signals[signal].length < 1) return;
    this.signals[signal].forEach((signalHandler: typing.ISignalCallback) =>
      signalHandler()
    );
  };
}
