import { createContext, useCallback, useEffect, useState } from "react";
import { fetchConfig } from "../api/client";

export const ConfigContext = createContext(null);

/**
 * ConfigProvider — fetches the site config and exposes it to the tree.
 *
 * In dev mode, also manages `activeClient` state so DevSwitcher can hot-swap
 * configs without a server restart.
 *
 * This file exports ONLY the ConfigProvider component so Vite's Fast Refresh
 * can hot-update it without blowing away React context state.
 * The `useConfig` hook lives in ./useConfig.js.
 */
export function ConfigProvider({ children }) {
  const [config, setConfig]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeClient, setActiveClient] = useState(null);

  const load = useCallback((clientId = null) => {
    setLoading(true);
    setError(null);
    fetchConfig(clientId)
      .then((cfg) => {
        setConfig(cfg);
        setActiveClient(clientId ?? cfg.client_id);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Initial load — use whichever CLIENT_ID the server has
  useEffect(() => {
    load(null);
  }, [load]);

  const switchClient = useCallback(
    (clientId) => {
      if (clientId !== activeClient) load(clientId);
    },
    [activeClient, load]
  );

  return (
    <ConfigContext.Provider value={{ config, loading, error, activeClient, switchClient }}>
      {children}
    </ConfigContext.Provider>
  );
}
