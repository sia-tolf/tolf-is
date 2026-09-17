(() => {
  const API = "https://api.tolf.is";
  const topActions = document.querySelector(".top-actions");
  const signIn = document.querySelector(".account-link");
  const signUp = document.querySelector(".signup-link");

  if (!topActions || !signIn || !signUp) return;

  const labels = {
    en: { account: "TOLF account", signedIn: "Signed in", logout: "Sign out" },
    ru: { account: "Аккаунт TOLF", signedIn: "Вы вошли", logout: "Выйти" },
    lv: { account: "TOLF konts", signedIn: "Esat pieteicies", logout: "Iziet" }
  };

  const style = document.createElement("style");
  style.textContent = `
    .account-link {
      color: var(--text) !important;
      font-weight: 600 !important;
    }

    body.account-authenticated .account-link,
    body.account-authenticated .signup-link {
      display: none !important;
    }

    .authenticated-account[hidden] {
      display: none !important;
    }

    .authenticated-account {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .authenticated-account-status {
      position: relative;
      min-width: 0;
      max-width: 200px;
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      padding: 0 10px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--surface);
      color: var(--text);
      font-size: 14px;
      font-weight: 560;
      white-space: nowrap;
      outline: none;
    }

    .authenticated-account-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .authenticated-account:not([hidden]) .authenticated-account-status::before {
      content: "";
      width: 8px;
      height: 8px;
      flex: 0 0 8px;
      margin-right: 7px;
      border-radius: 50%;
      background: #34c759;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.10);
    }

    .authenticated-account-tooltip {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 100;
      min-width: 170px;
      max-width: min(300px, 80vw);
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--surface-solid);
      box-shadow: var(--shadow);
      color: var(--text);
      text-align: left;
      white-space: normal;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-2px);
      transition: opacity .14s ease, transform .14s ease, visibility .14s ease;
      pointer-events: none;
    }

    .authenticated-account-tooltip-name {
      display: block;
      overflow-wrap: anywhere;
      font-size: 14px;
      line-height: 1.3;
      font-weight: 600;
    }

    .authenticated-account-tooltip-state {
      display: block;
      margin-top: 4px;
      color: var(--secondary);
      font-size: 12px;
      line-height: 1.3;
      font-weight: 500;
    }

    .authenticated-account-status:hover .authenticated-account-tooltip,
    .authenticated-account-status:focus-visible .authenticated-account-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .authenticated-account-status:focus-visible {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
    }

    .authenticated-account-logout {
      min-height: 38px;
      padding: 0 10px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: transparent;
      color: var(--text);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }

    .authenticated-account-logout:hover {
      background: var(--surface);
      border-color: var(--line);
      color: var(--text);
    }

    body.account-authenticated .account-bottom {
      display: none;
    }

    @media (max-width: 520px) {
      .authenticated-account-status {
        max-width: 132px;
        min-height: 34px;
        padding: 0 7px;
        font-size: 13px;
      }

      .authenticated-account-logout {
        min-height: 34px;
        padding: 0 6px;
        font-size: 14px;
        font-weight: 600;
      }

      .authenticated-account:not([hidden]) .authenticated-account-status::before {
        width: 7px;
        height: 7px;
        flex-basis: 7px;
        margin-right: 5px;
      }

      .authenticated-account-tooltip {
        max-width: min(260px, 86vw);
      }
    }
  `;
  document.head.appendChild(style);

  const controls = document.createElement("div");
  controls.className = "authenticated-account";
  controls.hidden = true;

  const status = document.createElement("span");
  status.className = "authenticated-account-status";
  status.tabIndex = 0;

  const statusName = document.createElement("span");
  statusName.className = "authenticated-account-name";

  const tooltip = document.createElement("span");
  tooltip.className = "authenticated-account-tooltip";
  tooltip.setAttribute("role", "tooltip");

  const tooltipName = document.createElement("span");
  tooltipName.className = "authenticated-account-tooltip-name";

  const tooltipState = document.createElement("span");
  tooltipState.className = "authenticated-account-tooltip-state";

  tooltip.append(tooltipName, tooltipState);
  status.append(statusName, tooltip);

  const logout = document.createElement("button");
  logout.type = "button";
  logout.className = "authenticated-account-logout";

  controls.append(status, logout);
  topActions.appendChild(controls);

  let accountData = null;

  function language() {
    return ["en", "ru", "lv"].includes(document.documentElement.lang)
      ? document.documentElement.lang
      : "en";
  }

  function accountName(data) {
    const candidates = [
      data?.display_name,
      data?.displayName,
      data?.name,
      data?.username,
      data?.vpn?.username,
      data?.user?.display_name,
      data?.user?.displayName,
      data?.user?.name,
      data?.user?.username
    ];

    return candidates.find(value => typeof value === "string" && value.trim())?.trim() || "";
  }

  function compactAccountName(name) {
    if (!name) return "";
    const compact = name.replace(/^user_/i, "");
    return compact || name;
  }

  function refreshLabels() {
    const lang = language();
    const copy = labels[lang];
    const fullName = accountName(accountData);
    const displayName = fullName ? compactAccountName(fullName) : copy.account;
    const tooltipFullName = fullName || copy.account;

    statusName.textContent = displayName;
    tooltipName.textContent = tooltipFullName;
    tooltipState.textContent = copy.signedIn;
    status.setAttribute("aria-label", `${tooltipFullName}. ${copy.signedIn}`);
    logout.textContent = copy.logout;
  }

  function showAuthenticated(data) {
    accountData = data || {};
    signIn.hidden = true;
    signUp.hidden = true;
    controls.hidden = false;
    refreshLabels();
  }

  function showGuest() {
    accountData = null;
    controls.hidden = true;
    statusName.textContent = "";
    tooltipName.textContent = "";
    tooltipState.textContent = "";
    logout.textContent = "";
    signIn.hidden = false;
    signUp.hidden = false;
  }

  async function loadState() {
    try {
      const response = await fetch(`${API}/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        showGuest();
        return;
      }

      let data = {};
      try { data = await response.json(); } catch (_) {}
      showAuthenticated(data);
    } catch (_) {
      showGuest();
    }
  }

  logout.addEventListener("click", async () => {
    logout.disabled = true;
    try {
      const response = await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
      if (!response.ok) throw new Error("logout failed");
      window.location.reload();
    } catch (_) {
      logout.disabled = false;
    }
  });

  new MutationObserver(refreshLabels).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  loadState();
})();
