const TOLF = {
  routes: {
    vpn: "https://vpn.tolf.is/",
    configurator: "https://configurator.tolf.is/",
    dns: null,
    recovery: null,
    accountSignIn: "https://vpn.tolf.is/?action=signin",
    accountCreate: "https://vpn.tolf.is/?action=signup",
    status: null,
    privacy: null,
    contact: null
  },
  api: "https://api.tolf.is"
};

const langButtons = {
  en: document.getElementById("lang-en"),
  lv: document.getElementById("lang-lv"),
  ru: document.getElementById("lang-ru")
};

function cleanHeroTitlePunctuation() {
  const title = document.querySelector(".hero h1");
  if (!title) return;

  title.innerHTML = title.innerHTML.replace(/\.(?=<br\s*\/?\s*>|$)/g, "");
}

function fitHeroTitle() {
  const title = document.querySelector(".hero h1");
  if (!title) return;

  const isNarrow = window.matchMedia("(max-width: 520px)").matches;
  const isRussian = document.documentElement.lang === "ru";

  if (isNarrow && isRussian) {
    title.style.fontSize = "clamp(36px, 10.8vw, 46px)";
    title.style.letterSpacing = "-0.055em";
  } else {
    title.style.removeProperty("font-size");
    title.style.removeProperty("letter-spacing");
  }
}

function localizedRoute(base) {
  const url = new URL(base);
  url.searchParams.set("lang", document.documentElement.lang);
  return url.toString();
}

function refreshAccountLinks() {
  const signIn = localizedRoute(TOLF.routes.accountSignIn);
  const signUp = localizedRoute(TOLF.routes.accountCreate);
  const configurator = localizedRoute(TOLF.routes.configurator);

  document.querySelectorAll('[data-route="account-signin"]').forEach((link) => {
    link.href = signIn;
  });

  document.querySelectorAll('[data-route="account-create"]').forEach((link) => {
    link.href = signUp;
  });

  document.querySelectorAll('[data-route="configurator"]').forEach((link) => {
    link.href = configurator;
  });

  const headerSignIn = document.querySelector(".account-link");
  const headerSignUp = document.querySelector(".signup-link");

  if (headerSignIn) headerSignIn.href = signIn;
  if (headerSignUp) headerSignUp.href = signUp;
}

function setLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-en][data-lv][data-ru]").forEach((element) => {
    element.innerHTML = element.dataset[lang];
  });

  cleanHeroTitlePunctuation();

  Object.entries(langButtons).forEach(([key, button]) => {
    button.classList.toggle("active", key === lang);
    button.setAttribute("aria-pressed", key === lang ? "true" : "false");
  });

  localStorage.setItem("tolf-language", lang);
  fitHeroTitle();
  refreshAccountLinks();
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

  refreshAccountLinks();
}

function installGuestExperience() {
  const productGrid = document.querySelector(".product-grid");
  const hero = document.querySelector(".hero");

  if (!productGrid || !hero) return;

  const configuratorCard = productGrid
    .querySelector('[data-route="configurator"]')
    ?.closest(".card");

  if (configuratorCard && productGrid.firstElementChild !== configuratorCard) {
    productGrid.insertBefore(configuratorCard, productGrid.firstElementChild);
  }

  ["vpn", "dns", "recovery"].forEach((routeName) => {
    const link = productGrid.querySelector(`[data-route="${routeName}"]`);
    const card = link?.closest(".card");
    if (!link || !card) return;

    card.classList.add("protected-service");
    card.dataset.access = "protected";

    if (!card.querySelector(".service-lock-badge")) {
      const badge = document.createElement("span");
      badge.className = "service-lock-badge";
      badge.dataset.en = "Sign in required";
      badge.dataset.ru = "Требуется вход";
      badge.dataset.lv = "Nepieciešama pieteikšanās";
      badge.textContent = "Sign in required";
      card.appendChild(badge);
    }
  });

  if (!document.getElementById("guestAccess")) {
    const section = document.createElement("section");
    section.id = "guestAccess";
    section.className = "guest-access-section";
    section.innerHTML = `
      <div class="shell">
        <div class="guest-access-panel">
          <div class="guest-access-copy">
            <h2
              data-en="Start with TOLF"
              data-ru="Начните работу с TOLF"
              data-lv="Sāciet darbu ar TOLF"
            >Start with TOLF</h2>
            <p
              data-en="Sign in to your account or create a new one to use TOLF services. IKEv2 Configurator is available without registration."
              data-ru="Войдите в аккаунт или создайте новый, чтобы пользоваться сервисами TOLF. IKEv2 Configurator доступен без регистрации."
              data-lv="Piesakieties kontā vai izveidojiet jaunu, lai izmantotu TOLF pakalpojumus. IKEv2 Configurator ir pieejams bez reģistrācijas."
            >Sign in to your account or create a new one to use TOLF services. IKEv2 Configurator is available without registration.</p>
          </div>
          <div class="guest-access-actions">
            <a
              class="button"
              data-route="account-signin"
              data-en="Sign in"
              data-ru="Войти"
              data-lv="Pieteikties"
              href="#"
            >Sign in</a>
            <a
              class="button primary"
              data-route="account-create"
              data-en="Create account"
              data-ru="Создать аккаунт"
              data-lv="Izveidot kontu"
              href="#"
            >Create account</a>
          </div>
        </div>
      </div>
    `;
    hero.insertAdjacentElement("afterend", section);
  }

  if (!document.getElementById("guestAccessStyles")) {
    const style = document.createElement("style");
    style.id = "guestAccessStyles";
    style.textContent = `
      .guest-access-section {
        padding: 0 0 48px;
      }

      .guest-access-panel {
        padding: 26px 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface-solid);
        box-shadow: var(--shadow);
      }

      .guest-access-copy {
        min-width: 0;
      }

      .guest-access-copy h2 {
        margin: 0;
        font-size: 26px;
        line-height: 1.08;
        letter-spacing: -0.035em;
        font-weight: 640;
      }

      .guest-access-copy p {
        max-width: 680px;
        margin: 9px 0 0;
        color: var(--secondary);
        font-size: 16px;
        line-height: 1.45;
      }

      .guest-access-actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .protected-service {
        transition: opacity .16s ease;
      }

      .service-lock-badge {
        display: none;
        position: absolute;
        top: 20px;
        right: 20px;
        min-height: 28px;
        align-items: center;
        padding: 0 9px;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--soft);
        color: var(--secondary);
        font-size: 12px;
        font-weight: 560;
        white-space: nowrap;
      }

      body.account-guest .protected-service {
        opacity: .58;
      }

      body.account-guest .protected-service .service-lock-badge {
        display: inline-flex;
      }

      body.account-guest .protected-service .card-link {
        pointer-events: none;
        color: var(--tertiary);
      }

      body.account-authenticated .guest-access-section {
        display: none;
      }

      @media (max-width: 800px) {
        .guest-access-panel {
          display: block;
        }

        .guest-access-actions {
          margin-top: 20px;
        }
      }

      @media (max-width: 520px) {
        .guest-access-section {
          padding-bottom: 34px;
        }

        .guest-access-panel {
          padding: 22px;
          border-radius: 20px;
        }

        .guest-access-copy h2 {
          font-size: 24px;
        }

        .guest-access-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .guest-access-actions .button {
          width: 100%;
        }

        .service-lock-badge {
          top: 16px;
          right: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("account-guest")) return;

    const protectedLink = event.target.closest(".protected-service .card-link");
    if (!protectedLink) return;

    event.preventDefault();
    event.stopPropagation();
  }, true);
}

function setMainAccountState(authenticated) {
  document.body.classList.toggle("account-authenticated", authenticated);
  document.body.classList.toggle("account-guest", !authenticated);

  document.querySelectorAll(".protected-service .card-link").forEach((link) => {
    if (authenticated && link.dataset.route === "vpn") {
      link.removeAttribute("aria-disabled");
    } else if (!authenticated) {
      link.setAttribute("aria-disabled", "true");
    }
  });
}

async function detectMainAccountState() {
  setMainAccountState(false);

  try {
    const response = await fetch(`${TOLF.api}/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json"
      }
    });

    setMainAccountState(response.ok);
  } catch {
    setMainAccountState(false);
  }
}

function keepMobileSignInVisible() {
  const signIn = document.querySelector(".account-link");
  if (!signIn) return;

  if (window.matchMedia("(max-width: 520px)").matches) {
    signIn.style.display = "inline-flex";
    signIn.style.minHeight = "36px";
    signIn.style.padding = "0 8px";
    signIn.style.fontSize = "14px";
  } else {
    signIn.style.removeProperty("display");
    signIn.style.removeProperty("min-height");
    signIn.style.removeProperty("padding");
    signIn.style.removeProperty("font-size");
  }
}

function tightenHeroSpacing() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  if (window.matchMedia("(max-width: 520px)").matches) {
    hero.style.padding = "36px 0 42px";
  } else if (window.matchMedia("(max-width: 800px)").matches) {
    hero.style.padding = "40px 0 46px";
  } else {
    hero.style.padding = "40px 0 48px";
  }
}

langButtons.en.addEventListener("click", () => setLanguage("en"));
langButtons.lv.addEventListener("click", () => setLanguage("lv"));
langButtons.ru.addEventListener("click", () => setLanguage("ru"));

document.getElementById("year").textContent = new Date().getFullYear();

const url = new URL(window.location.href);
const requestedLanguage = ["en", "lv", "ru"].includes(url.searchParams.get("lang"))
  ? url.searchParams.get("lang")
  : null;
const savedLanguage = localStorage.getItem("tolf-language");
const browserLanguage = navigator.language.toLowerCase().startsWith("lv")
  ? "lv"
  : navigator.language.toLowerCase().startsWith("ru")
    ? "ru"
    : "en";

installGuestExperience();
setLanguage(
  requestedLanguage ||
  (["en", "lv", "ru"].includes(savedLanguage)
    ? savedLanguage
    : browserLanguage)
);

if (requestedLanguage) {
  url.searchParams.delete("lang");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

applyRoutes();
keepMobileSignInVisible();
tightenHeroSpacing();
fitHeroTitle();
detectMainAccountState();

window.addEventListener("resize", () => {
  keepMobileSignInVisible();
  tightenHeroSpacing();
  fitHeroTitle();
});
