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
    body.account-authenticated .account-link,
    body.account-authenticated .signup-link {
      display: none !important;
    }
    .authenticated-account {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .authenticated-account-status {
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
    }
    .authenticated-account-status::before {
      content: "";
      width: 8px;
      height: 8px;
      margin-right: 7px;
      border-radius: 50%;
      background: #34c759;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.10);
    }
    .authenticated-account-logout {
      min-height: 38px;
      padding: 0 10px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: transparent;
      color: var(--secondary);
      font: inherit;
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
        min-height: 34px;
        padding: 0 7px;
        font-size: 13px;
      }
      .authenticated-account-logout {
        min-height: 34px;
        padding: 0 6px;
        font-size: 14px;
      }
      .authenticated-account-status::before {
        width: 7px;
        height: 7px;
        margin-right: 5px;
      }
    }
  `;
  document.head.appendChild(style);

  const controls = document.createElement("div");
  controls.className = "authenticated-account";
  controls.hidden = true;

  const status = document.createElement("span");
  status.className = "authenticated-account-status";

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

  function refreshLabels() {
    const lang = language();
    const copy = labels[lang];
    const name = accountName(accountData);
    status.textContent = name || copy.account;
    status.title = copy.signedIn;
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
