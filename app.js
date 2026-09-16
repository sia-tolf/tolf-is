const TOLF = {
  routes: {
    vpn: "https://vpn.tolf.is/",
    configurator: "https://config.tolf.is/",
    dns: null,
    recovery: null,
    accountSignIn: null,
    accountCreate: null,
    status: null,
    privacy: null,
    contact: null
  }
};

const langButtons = {
  en: document.getElementById("lang-en"),
  lv: document.getElementById("lang-lv"),
  ru: document.getElementById("lang-ru")
};

function setLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-en][data-lv][data-ru]").forEach((element) => {
    element.innerHTML = element.dataset[lang];
  });

  Object.entries(langButtons).forEach(([key, button]) => {
    button.classList.toggle("active", key === lang);
    button.setAttribute("aria-pressed", key === lang ? "true" : "false");
  });

  localStorage.setItem("tolf-language", lang);
}

function applyRoutes() {
  const routeMap = {
    vpn: TOLF.routes.vpn,
    configurator: TOLF.routes.configurator,
    dns: TOLF.routes.dns,
    recovery: TOLF.routes.recovery,
    "account-signin": TOLF.routes.accountSignIn,
    "account-create": TOLF.routes.accountCreate,
    status: TOLF.routes.status,
    privacy: TOLF.routes.privacy,
    contact: TOLF.routes.contact
  };

  document.querySelectorAll("[data-route]").forEach((link) => {
    const route = routeMap[link.dataset.route];

    if (route) {
      link.href = route;
      return;
    }

    link.setAttribute("aria-disabled", "true");
    link.addEventListener("click", (event) => event.preventDefault());
  });
}

langButtons.en.addEventListener("click", () => setLanguage("en"));
langButtons.lv.addEventListener("click", () => setLanguage("lv"));
langButtons.ru.addEventListener("click", () => setLanguage("ru"));

document.getElementById("year").textContent = new Date().getFullYear();

const savedLanguage = localStorage.getItem("tolf-language");
const browserLanguage = navigator.language.toLowerCase().startsWith("lv")
  ? "lv"
  : navigator.language.toLowerCase().startsWith("ru")
    ? "ru"
    : "en";

setLanguage(
  ["en", "lv", "ru"].includes(savedLanguage)
    ? savedLanguage
    : browserLanguage
);

applyRoutes();
