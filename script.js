const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function setNavOpen(isOpen) {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute("aria-expanded", String(isOpen));
  siteNav.dataset.open = String(isOpen);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    setNavOpen(!isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setNavOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      setNavOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });
}
