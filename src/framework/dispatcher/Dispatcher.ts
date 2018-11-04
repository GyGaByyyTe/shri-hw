import * as typing from "../interfaces/index";

export class Dispatcher {
  handlers: typing.IHandler;

  constructor() {
    this.handlers = {};
  }

  register = (actionType: typing.ActionType, handler: typing.Callback) => {
    if (!this.handlers[actionType]) {
      this.handlers[actionType] = [];
    }
    this.handlers[actionType].push(handler);
  };

  dispatch = (action: typing.IAction) => {
    this.handlers[action.type].forEach(handle => {
      handle(action.payload);
    });
  };
}
