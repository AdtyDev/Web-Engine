// § 6.4 — Runtime API URL pattern.
// API_URL="" means same-origin; nginx proxies /api to the backend container.
// On a PaaS, set API_URL in public/runtime-config.js to the actual backend domain — no rebuild needed.
const API_BASE = window.__APP_CONFIG__?.API_URL || "/api";

export const fetchConfig = () =>
  fetch(`${API_BASE}/config`).then((r) => {
    if (!r.ok) throw new Error(`Failed to load config: ${r.status}`);
    return r.json();
  });

export const postContact = (data) =>
  fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => {
    if (!r.ok) throw new Error(`Contact submission failed: ${r.status}`);
    return r.json();
  });
