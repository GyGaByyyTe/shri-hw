import { Dispatcher } from "./dispatcher/Dispatcher";
import { Store } from "./store/Store";
import * as types from "./interfaces/index";

export class Flux {
  dispatcher: Dispatcher;
  constructor() {
    this.dispatcher = new Dispatcher();
  }

  createStore = (obj: object) => {
    const store = new Store(obj);
    return store;
  };
  register = (actionType: types.ActionType, handler: types.Callback) => {
    this.dispatcher.register(actionType, handler);
  };
  dispatch = (action: types.IAction) => {
    this.dispatcher.dispatch(action);
  };
}
