import { pointerEventsInit } from "./pointer";
import { videoInit } from "./video";

import { Flux } from "../framework/index";

if (document.querySelector("#hamburger")) {
  const hamburgerButton: HTMLDivElement | null = document.querySelector(
    ".hamburger"
  );
  const navigationMenu: HTMLDivElement | null = document.querySelector(".menu");
  const hamburgerLines: HTMLLinkElement | null = document.querySelector(
    ".hamburger__link"
  );
  if (hamburgerButton && hamburgerLines && navigationMenu) {
    hamburgerButton.addEventListener("click", function(event: MouseEvent) {
      event.preventDefault();
      hamburgerLines.classList.toggle("hamburger__link--pressed");
      navigationMenu.classList.toggle("menu--active");
    });
  }
}

const initScripts = () => {
  if (document.querySelector("#main-viewer")) {
    pointerEventsInit();
  }
  if (document.querySelector(".multimedia__canvas")) {
    videoInit();
  }
};
initScripts();
//"SPA" через store
const FluxInit = () => {
  //link items
  const links = ["main", "video", "pointer"];
  //main element on page
  const root = document.querySelector<HTMLMainElement>("#root");
  //fetch страницы по имени
  const setPage = () => {
    const { page } = store.data;
    fetch(`/${page}`)
      .then(function(response) {
        return response.text();
      })
      .then(html => {
        if (root) {
          root.innerHTML = html;
          initScripts();
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
  // переключение класса активной вкладки
  const toggleActiveLink = () => {
    const { page: id } = store.data;
    for (let i = 0; i < links.length; i++) {
      const elem = document.querySelector<HTMLLinkElement>(`#${links[i]}`);
      if (!elem) continue;
      const parent = <HTMLElement>elem.parentElement;
      if (elem.id === id) {
        parent.classList.add("menu__item--active");
      } else {
        parent.classList.remove("menu__item--active");
      }
    }
  };
  //взять стор из localstorage
  const obj = localStorage.getItem("store")
    ? JSON.parse(<string>localStorage.getItem("store"))
    : { page: "main" };

  const App = new Flux();
  const store = App.createStore(obj);
  localStorage.setItem("store", JSON.stringify(store.data));

  //регистрация Callback на action
  App.register("CHANGE_PAGE", (payload: any) => {
    store.data["page"] = payload;
    localStorage.setItem("store", JSON.stringify(store.data));
  });

  store.onChange("page", () => {
    setPage();
  });
  store.onChange("page", () => {
    toggleActiveLink();
  });

  const changePage = (name: string) => {
    //создание Action
    const action = {
      type: "CHANGE_PAGE",
      payload: name
    };
    // вызов метода
    App.dispatch(action);
  };

  for (let i = 0; i < links.length; i++) {
    const elem = document.querySelector<HTMLLinkElement>(`#${links[i]}`);
    if (!elem) continue;
    elem.addEventListener("click", event => {
      event.preventDefault();
      changePage(`${links[i]}`);
    });
  }

  changePage(`${store.data.page}`);
};
FluxInit();
