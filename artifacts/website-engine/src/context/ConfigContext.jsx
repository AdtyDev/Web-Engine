import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchConfig } from "../api/client";

const ConfigContext = createContext(null);

/**
 * ConfigProvider — fetches the site config and exposes it to the tree.
 *
 * In dev mode the provider also manages an `activeClient` state so the
 * DevSwitcher component can hot-swap configs without a server restart.
 */
export function ConfigProvider({ children }) {
  const [config, setConfig]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeClient, setActiveClient] = useState(null); // null = use server default

  const load = useCallback((clientId = null) => {
    setLoading(true);
    setError(null);
    fetchConfig(clientId)
      .then((cfg) => {
        setConfig(cfg);
        setActiveClient(clientId ?? cfg.client_id);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Initial load — use whatever CLIENT_ID the server has
  useEffect(() => {
    load(null);
  }, [load]);

  // Switching function exposed to children (DevSwitcher uses this)
  const switchClient = useCallback(
    (clientId) => {
      if (clientId !== activeClient) {
        load(clientId);
      }
    },
    [activeClient, load]
  );

  return (
    <ConfigContext.Provider value={{ config, loading, error, activeClient, switchClient }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used inside ConfigProvider");
  return ctx;
}
