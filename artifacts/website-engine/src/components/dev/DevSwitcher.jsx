import { useState } from "react";
import { useConfig } from "../../context/ConfigContext";

/**
 * DevSwitcher — floating panel that lets you hot-swap between client configs.
 *
 * Only rendered when Vite's import.meta.env.DEV is true (never in production builds).
 * Shows a floating pill in the bottom-right corner; expands to a small panel on click.
 *
 * The panel lists all available clients. Switching re-fetches from /api/config?client=X.
 */

const CLIENTS = [
  {
    id: "clinic",
    label: "Clinic",
    emoji: "🏥",
    description: "Multi-speciality clinic, navy theme",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    emoji: "🍽️",
    description: "Fine dining, warm amber theme",
  },
  {
    id: "gym",
    label: "Gym",
    emoji: "💪",
    description: "Fitness centre, red theme + pricing",
  },
];

export function DevSwitcher() {
  const { activeClient, switchClient, loading } = useConfig();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed bottom-5 right-5 z-[999] flex flex-col items-end gap-2"
      role="complementary"
      aria-label="Dev client switcher"
    >
      {/* Expanded panel */}
      {open && (
        <div className="bg-gray-900/95 backdrop-blur text-white rounded-xl shadow-2xl p-4 w-64 border border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Dev — Switch Client
          </p>
          <div className="space-y-1.5">
            {CLIENTS.map((c) => {
              const isActive = activeClient === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    switchClient(c.id);
                    setOpen(false);
                  }}
                  disabled={loading || isActive}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-all ${
                    isActive
                      ? "bg-white/15 cursor-default"
                      : "hover:bg-white/10 active:bg-white/20 disabled:opacity-40"
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold leading-none mb-0.5">
                      {c.label}
                      {isActive && (
                        <span className="ml-2 text-xs font-normal text-green-400">active</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{c.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-white/10">
            Calls <code className="text-gray-500">/api/config?client=…</code><br />
            Only available when <code className="text-gray-500">ENV=dev</code>
          </p>
        </div>
      )}

      {/* Toggle pill */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg text-white text-sm font-medium transition-all ${
          open ? "bg-gray-700" : "bg-gray-900 hover:bg-gray-800"
        }`}
        aria-expanded={open}
        aria-label={open ? "Close dev switcher" : "Open dev switcher"}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-base">⚙️</span>
        )}
        <span>Dev</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
