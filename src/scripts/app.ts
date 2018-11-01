import { pointerEventsInit } from "./pointer";
import { videoInit } from "./video";

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
if (document.querySelector("#main-viewer")) {
  pointerEventsInit();
}
if (document.querySelector(".multimedia__canvas")) {
  videoInit();
}
