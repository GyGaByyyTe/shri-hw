document.addEventListener(
  "DOMContentLoaded",
  () => {
    if (document.querySelector("#hamburger")) {
      var hamburgerButton = document.querySelector(".hamburger");
      var naviationMenu = document.querySelector(".menu");
      var hamburgerLines = document.querySelector(".hamburger__link");

      hamburgerButton.addEventListener("click", function(ev) {
        ev.preventDefault();
        hamburgerLines.classList.toggle("hamburger__link--pressed");
        naviationMenu.classList.toggle("menu--active");
      });
    }
  },
  false
);
