// § 6.4 — Runtime API URL pattern.
// API_URL="" means same-origin; nginx proxies /api to the backend container.
// On a PaaS, set API_URL in public/runtime-config.js to the actual backend domain — no rebuild needed.
const API_BASE = window.__APP_CONFIG__?.API_URL || "/api";

/**
 * Fetch the site config.
 * @param {string|null} clientOverride  Dev-only: pass a client_id to preview a different config.
 */
export const fetchConfig = (clientOverride = null) => {
  const url = clientOverride
    ? `${API_BASE}/config?client=${encodeURIComponent(clientOverride)}`
    : `${API_BASE}/config`;
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed to load config: ${r.status}`);
    return r.json();
  });
};

/**
 * Submit the contact form.
 * On success: resolves with { status: "ok" }.
 * On failure: rejects with a ContactError that has { httpStatus, code, message }.
 *
 * Callers should catch ContactError and branch on `err.code`:
 *   "rate_limited"      → 429 — user sent too many requests
 *   "email_unavailable" → 503 — SMTP is down
 *   "validation_error"  → 422 — invalid field data
 *   "network_error"     → fetch failed entirely (offline, DNS, etc.)
 *   "unknown"           → any other 4xx/5xx
 */
export class ContactError extends Error {
  constructor(httpStatus, code, message) {
    super(message);
    this.name = "ContactError";
    this.httpStatus = httpStatus;
    this.code = code;
  }
}

export const postContact = async (data) => {
  let response;
  try {
    response = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new ContactError(0, "network_error", "Could not reach the server. Please check your connection.");
  }

  if (response.ok) {
    return response.json();
  }

  // Try to parse a structured error body from the backend
  let detail = null;
  try {
    const body = await response.json();
    detail = body?.detail ?? null;
  } catch {
    // Non-JSON error body — ignore
  }

  const code = detail?.code ?? "unknown";
  const message =
    detail?.message ??
    (response.status === 422
      ? "Please check your form fields and try again."
      : "Something went wrong. Please try again.");

  throw new ContactError(response.status, code, message);
};
