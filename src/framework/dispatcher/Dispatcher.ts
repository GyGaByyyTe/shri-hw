import * as typing from "../interfaces/index";

export class Dispatcher {
  handlers: typing.IHandler;

  constructor() {
    this.handlers = {};
  }

  register = (action: typing.IAction, handler: typing.Callback) => {
    if (!this.handlers[action.type]) {
      this.handlers[action.type] = [];
    }
    this.handlers[action.type].push(handler);
  };

  dispatch = (action: typing.IAction) => {
    this.handlers[action.type].forEach(handle => {
      handle(action.payload);
    });
  };
}
