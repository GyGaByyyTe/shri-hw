import { Dispatcher } from "./dispatcher/Dispatcher";
import { Store } from "./store/Store";
import { ActionPayload } from "./interfaces/index";

export class Flux {
  store: Store | null;
  constructor() {
    this.store = null;
  }

  connect = () => {};
}

const disp = new Dispatcher();

const store = new Store({
  x: 2,
  y: 3
});

store.observe("x", () => {
  console.log("olololo");
});

const newAction = {
  type: "GET_NEW_PAGE",
  payload: "index.html"
};

const getNewPage = (payload: ActionPayload) => {
  console.log(payload);
  store.data["x"] = 5;
};

disp.register(newAction, getNewPage);

setTimeout(() => {
  disp.dispatch(newAction);
}, 1000);
