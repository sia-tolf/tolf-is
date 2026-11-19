const TOLF = {
  routes: {
    vpn: "https://vpn.tolf.is/",
    configurator: "https://configurator.tolf.is/",
    dns: null,
    accountSignIn: "https://vpn.tolf.is/auth/?mode=signin&next=home",
    accountCreate: "https://vpn.tolf.is/auth/?mode=signup&next=home",
    status: null,
    privacy: "https://vpn.tolf.is/privacy.html",
    terms: "https://vpn.tolf.is/terms.html",
    contact: "https://vpn.tolf.is/contact.html"
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
  if (url.hostname === "vpn.tolf.is" && ["/privacy.html", "/terms.html", "/contact.html"].includes(url.pathname)) {
    url.pathname = "/" + document.documentElement.lang + url.pathname;
    return url.toString();
  }
  url.searchParams.set("lang", document.documentElement.lang);
  return url.toString();
}

function refreshAccountLinks() {
  const signIn = localizedRoute(TOLF.routes.accountSignIn);
  const signUp = localizedRoute(TOLF.routes.accountCreate);
  const configurator = localizedRoute(TOLF.routes.configurator);
  const vpn = localizedRoute(TOLF.routes.vpn);

  document.querySelectorAll('[data-route="vpn"]').forEach((link) => {
    link.href = vpn;
  });

  document.querySelectorAll('[data-route="account-signin"]').forEach((link) => {
    link.href = signIn;
  });

  document.querySelectorAll('[data-route="account-create"]').forEach((link) => {
    link.href = signUp;
  });

  document.querySelectorAll('[data-route="configurator"]').forEach((link) => {
    link.href = configurator;
  });

  for (const routeName of ["privacy", "terms", "contact"]) {
    document.querySelectorAll('[data-route="' + routeName + '"]').forEach(link => {
      link.href = localizedRoute(TOLF.routes[routeName]);
    });
  }

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
    if (key === lang) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  try { localStorage.setItem("tolf-language", lang); } catch {}
  fitHeroTitle();
  refreshAccountLinks();
}

function applyRoutes() {
  const routeMap = {
    vpn: TOLF.routes.vpn,
    configurator: TOLF.routes.configurator,
    dns: TOLF.routes.dns,
    "account-signin": TOLF.routes.accountSignIn,
    "account-create": TOLF.routes.accountCreate,
    status: TOLF.routes.status,
    privacy: TOLF.routes.privacy,
    terms: TOLF.routes.terms,
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

function installStartOptions(section, actions) {
  const words = {
    ru: {start:"Начать работу с TOLF", trial:"Попробовать бесплатно", help:"1 ГБ VPN-трафика без ограничения по времени. Один раз на аккаунт.", claim:"Получить 1 ГБ бесплатно", paid:"Купить трафик", paidHelp:"Выберите объём VPN-трафика. Оплаченные гигабайты не сгорают в конце месяца.", buy:"Выбрать пакет", loading:"Проверяем пробный пакет…", balance:"Остаток пробного трафика", unit:"ГБ", view:"Посмотреть остаток", unavailable:"Пробный пакет недоступен для этого аккаунта.", error:"Не удалось проверить остаток.", check:"Открыть пробный пакет"},
    en: {start:"Start with TOLF", trial:"Try it for free", help:"1 GB of VPN traffic with no time limit. Once per account.", claim:"Get 1 GB for free", paid:"Buy traffic", paidHelp:"Choose how much VPN traffic you need. Purchased data carries over each month.", buy:"Choose a package", loading:"Checking your trial…", balance:"Trial traffic remaining", unit:"GB", view:"View balance", unavailable:"The trial is unavailable for this account.", error:"Could not check your balance.", check:"Open trial package"},
    lv: {start:"Sākt lietot TOLF", trial:"Izmēģināt bez maksas", help:"1 GB VPN datu bez laika ierobežojuma. Vienu reizi katram kontam.", claim:"Saņemt 1 GB bez maksas", paid:"Pirkt VPN datus", paidHelp:"Izvēlieties VPN datu apjomu. Apmaksāto datu atlikums saglabājas arī nākamajā mēnesī.", buy:"Izvēlēties datu paku", loading:"Pārbaudām izmēģinājuma paku…", balance:"Atlikušie izmēģinājuma dati", unit:"GB", view:"Skatīt atlikumu", unavailable:"Šim kontam izmēģinājuma paka nav pieejama.", error:"Neizdevās pārbaudīt atlikumu.", check:"Atvērt izmēģinājuma paku"}
  };
  const lang = document.documentElement.lang;
  const t = words[lang] || words.en;
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "why-tolf-button start-tolf-button";
  trigger.textContent = t.start;
  trigger.setAttribute("aria-controls", section.id);
  trigger.setAttribute("aria-expanded", "false");
  actions.append(trigger);
  section.hidden = true;
  section.innerHTML = `<div class="start-grid">
      <div class="start-card"><h2>${t.trial}</h2><p aria-live="polite"></p><a class="button" hidden></a></div>
      <div class="start-card"><h2>${t.paid}</h2><p>${t.paidHelp}</p><a class="button primary">${t.buy}</a></div>
    </div>`;
  const [trial, paid] = section.querySelectorAll("a");
  const note = section.querySelector("p");
  const billing = localizedRoute("https://vpn.tolf.is/billing/");
  const trialUrl = localizedRoute("https://vpn.tolf.is/billing/?trial=1");
  const register = "https://vpn.tolf.is/auth/?mode=signup&next=billing";
  let pending = false;
  async function refresh() {
    if (section.hidden || pending) return;
    pending = true;
    trial.hidden = true;
    paid.removeAttribute("href");
    note.textContent = t.loading;
    try {
      const response = await fetch(TOLF.api + "/account/trial-package", {
        credentials:"include", cache:"no-store", signal:AbortSignal.timeout(8000)
      });
      const guest = response.status === 401;
      if (!guest && !response.ok) throw new Error("trial unavailable");
      const data = guest ? null : await response.json();
      const pack = data?.trialPackage;
      paid.href = guest ? localizedRoute(register) : billing;
      trial.href = guest ? localizedRoute(register + "&purpose=trial") : trialUrl;
      if (pack) {
        const amount = new Intl.NumberFormat(lang, {maximumFractionDigits:3}).format(pack.balanceBytes / 1e9);
        note.textContent = t.balance + " — " + amount + " " + t.unit;
        trial.textContent = t.view;
        trial.hidden = false;
      } else if (guest || data.canClaim) {
        note.textContent = t.help;
        trial.textContent = t.claim;
        trial.hidden = false;
      } else {
        note.textContent = t.unavailable;
      }
    } catch {
      note.textContent = t.error;
      trial.textContent = t.check;
      trial.href = trialUrl;
      trial.hidden = false;
      paid.href = billing;
    } finally {
      pending = false;
    }
  }
  trigger.addEventListener("click", () => {
    section.hidden = !section.hidden;
    trigger.setAttribute("aria-expanded", String(!section.hidden));
    refresh();
  });
  window.addEventListener("pageshow", refresh);
}

function installGuestExperience() {
  const productGrid = document.querySelector(".product-grid");
  const actions = document.querySelector(".hero .why-tolf-action");

  if (!productGrid || !actions) return;

  const configuratorCard = productGrid
    .querySelector('[data-route="configurator"]')
    ?.closest(".card");

  if (configuratorCard && productGrid.firstElementChild !== configuratorCard) {
    productGrid.insertBefore(configuratorCard, productGrid.firstElementChild);
  }

  ["vpn", "dns"].forEach((routeName) => {
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
      card.insertBefore(badge, link);
    }
  });

  if (!document.getElementById("guestAccess")) {
    const section = document.createElement("section");
    section.id = "guestAccess";
    installStartOptions(section, actions);
    actions.insertAdjacentElement("afterend", section);
  }

  if (!document.getElementById("guestAccessStyles")) {
    const style = document.createElement("style");
    style.id = "guestAccessStyles";
    style.textContent = `
      .start-grid {display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr)); gap:16px; margin-top:18px;}
      .start-card {display:flex; flex-direction:column; align-items:flex-start; padding:22px; border:1px solid var(--line); border-radius:var(--radius); background:var(--surface-solid);}
      .start-card h2 {margin:0; font-size:22px}
      .start-card p {margin:10px 0 20px; color:var(--secondary)}
      .start-card .button {margin-top:auto; width:100%; box-sizing:border-box; justify-content:center; text-align:center;}
      .start-card [hidden] {display:none}
      .protected-service {
        transition: opacity .16s ease;
      }

      .service-lock-badge {
        display: none;
        position: static;
        align-self: flex-start;
        max-width: 100%;
        margin-top: 18px;
        align-items: center;
        padding: 5px 9px;
        border-radius: 999px;
        background: var(--soft);
        color: var(--secondary);
        font-size: 13px;
        font-weight: 560;
      }

      body.account-guest .protected-service {
        opacity: 1;
      }

      body.account-guest .protected-service .service-lock-badge {
        display: inline-flex;
      }

      body.account-guest .protected-service .card-link {
        pointer-events: none;
        color: var(--tertiary);
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
    hero.style.padding = "20px 0 42px";
  } else if (window.matchMedia("(max-width: 700px)").matches) {
    hero.style.padding = "20px 0 46px";
  } else if (window.matchMedia("(max-width: 800px)").matches) {
    hero.style.padding = "40px 0 46px";
  } else {
    hero.style.padding = "40px 0 48px";
  }
}

// Every language has a crawlable URL. Preserve campaign parameters and anchors.
for (const [lang, link] of Object.entries(langButtons)) {
  const destination = new URL(link.href);
  const parameters = new URLSearchParams(window.location.search);
  parameters.delete("lang");
  parameters.delete("ui");
  destination.search = parameters.toString();
  destination.hash = window.location.hash;
  link.href = destination.href;
  link.addEventListener("click", () => {
    try { localStorage.setItem("tolf-language", lang); } catch {}
  });
}

document.getElementById("year").textContent = new Date().getFullYear();

const url = new URL(window.location.href);
const requestedLanguage = ["en", "lv", "ru"].includes(url.searchParams.get("lang"))
  ? url.searchParams.get("lang")
  : null;
// Legacy links retain their explicit language on the new permanent URLs.
// A language page always keeps the language declared in its static HTML.
const isHomeAlias = url.pathname === "/" || url.pathname === "/index.html";
if (isHomeAlias && requestedLanguage) {
  url.pathname = "/" + requestedLanguage + "/";
  url.searchParams.delete("lang");
  url.searchParams.delete("ui");
  window.location.replace(url.pathname + url.search + url.hash);
} else if (url.searchParams.has("lang") || url.searchParams.has("ui")) {
  url.searchParams.delete("lang");
  url.searchParams.delete("ui");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

installGuestExperience();
setLanguage(document.documentElement.lang);

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
