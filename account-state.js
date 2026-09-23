(() => {
  const API = "https://api.tolf.is";
  const topActions = document.querySelector(".top-actions");
  const signIn = document.querySelector(".account-link");
  const signUp = document.querySelector(".signup-link");
  const smartDnsCard = document.querySelector("[data-smart-dns-card]");
  const smartDnsLink = document.querySelector("[data-smart-dns-link]");

  if (!topActions || !signIn || !signUp) return;

  function setSmartDnsAccess(enabled) {
    if (!smartDnsCard || !smartDnsLink) return;
    smartDnsCard.classList.toggle("smart-dns-enabled", Boolean(enabled));
    smartDnsLink.href = enabled
      ? "https://smartdns.tolf.is/?lang=" + language()
      : "#";
    smartDnsLink.setAttribute("aria-disabled", String(!enabled));
    if (enabled) smartDnsLink.removeAttribute("tabindex");
    else smartDnsLink.setAttribute("tabindex", "-1");
  }

  const labels = {
    en: { account: "TOLF account", signedIn: "Signed in", logout: "Sign out", usedForSignIn: "Used to sign in", accountLabel: "Account" },
    ru: { account: "Аккаунт TOLF", signedIn: "Вы вошли", logout: "Выйти", usedForSignIn: "Использован для входа", accountLabel: "Аккаунт" },
    lv: { account: "TOLF konts", signedIn: "Esat pieteicies", logout: "Iziet", usedForSignIn: "Izmantots, lai pieteiktos", accountLabel: "Konts" }
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
      text-decoration: none;
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
      cursor: pointer;
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
      pointer-events: auto;
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

    .authenticated-account-tooltip[hidden] { display: none !important; }
    .authenticated-account-tooltip-account {
      display: block;
      margin-top: 7px;
      padding-top: 7px;
      border-top: 1px solid var(--line);
      overflow-wrap: anywhere;
      font-size: 12px;
      line-height: 1.35;
      color: var(--secondary);
    }
    .authenticated-account-tooltip-account[hidden] { display: none !important; }

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

  const status = document.createElement("a");
  status.className = "authenticated-account-status";
  status.tabIndex = 0;
  status.href = "https://vpn.tolf.is/account/";
  status.setAttribute("aria-expanded", "false");
  status.setAttribute("data-user-content", "");

  const statusName = document.createElement("span");
  statusName.className = "authenticated-account-name";

  const tooltip = document.createElement("span");
  tooltip.className = "authenticated-account-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.id = "tolfAccountTooltip";
  tooltip.hidden = true;
  status.setAttribute("aria-describedby", tooltip.id);

  const tooltipName = document.createElement("span");
  tooltipName.className = "authenticated-account-tooltip-name";

  const tooltipState = document.createElement("span");
  tooltipState.className = "authenticated-account-tooltip-state";

  const tooltipAccount = document.createElement("span");
  tooltipAccount.className = "authenticated-account-tooltip-account";
  tooltipAccount.hidden = true;
  tooltip.append(tooltipName, tooltipState, tooltipAccount);
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

  // Contract: /me.currentPasskey is provided by the server for this session.
  // Never infer a current key from key-list ordering, device name or browser storage.
  function currentPasskeyName(data) {
    const value = data?.currentPasskey?.name;
    return typeof value === "string" && value.trim() ? value.trim() : "";
  }

  function compactPasskeyName(name) {
    if (!name) return "";
    const trimmed = name.trim();
    const match = trimmed.match(/^TOLF[\s\-–—_:·./|#]+(.+)$/i);
    return match?.[1]?.trim() || trimmed;
  }

  function refreshLabels() {
    const lang = language();
    if (smartDnsCard?.classList.contains("smart-dns-enabled")) {
      setSmartDnsAccess(true);
    }
    const copy = labels[lang];
    const fullName = accountName(accountData);
    const keyName = currentPasskeyName(accountData);
    const displayName = keyName ? compactPasskeyName(keyName) : (fullName ? compactAccountName(fullName) : copy.account);
    const tooltipFullName = keyName || fullName || copy.account;

    statusName.textContent = copy.account;
    status.href = "https://vpn.tolf.is/account/?lang=" + lang;
    tooltipName.textContent = tooltipFullName;
    tooltipState.textContent = keyName ? copy.usedForSignIn : copy.signedIn;
    tooltipAccount.hidden = !keyName || !fullName;
    tooltipAccount.textContent = keyName && fullName ? `${copy.accountLabel}: ${fullName}` : "";
    status.setAttribute("aria-label", copy.account);
    logout.textContent = copy.logout;
  }

  function showAuthenticated(data) {
    accountData = data || {};
    signIn.hidden = true;
    signUp.hidden = true;
    controls.hidden = false;
    setSmartDnsAccess(true);
    refreshLabels();
  }

  function showGuest() {
    setTooltip(false);
    accountData = null;
    controls.hidden = true;
    statusName.textContent = "";
    tooltipName.textContent = "";
    tooltipState.textContent = "";
    tooltipAccount.textContent = "";
    tooltipAccount.hidden = true;
    logout.textContent = "";
    signIn.hidden = false;
    signUp.hidden = false;
    setSmartDnsAccess(false);
  }

  async function loadState() {
    try {
      const response = await fetch(`${API}/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
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

  function setTooltip(open) {
    const visible = Boolean(open && !controls.hidden);
    tooltip.hidden = !visible;
    status.setAttribute("aria-expanded", String(visible));
  }
  status.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") setTooltip(true);
  });
  status.addEventListener("pointerleave", event => {
    if (event.pointerType === "mouse") setTooltip(false);
  });
  status.addEventListener("focus", () => {
    if (status.matches(":focus-visible")) setTooltip(true);
  });
  status.addEventListener("blur", () => setTooltip(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setTooltip(false);
  });
  document.addEventListener("pointerdown", event => {
    if (!status.contains(event.target)) setTooltip(false);
  });

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
