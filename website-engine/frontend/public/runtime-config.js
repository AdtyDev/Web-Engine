// Runtime API URL injection.
// On a VPS (nginx same-origin proxy): leave API_URL as "" — the browser calls /api directly.
// On a PaaS (separate backend domain): overwrite this file at deploy time, e.g.:
//   echo "window.__APP_CONFIG__={API_URL:'https://my-backend.onrender.com'};" > public/runtime-config.js
window.__APP_CONFIG__ = { API_URL: "" };
