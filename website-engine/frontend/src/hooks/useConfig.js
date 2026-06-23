import { useContext } from "react";
import { ConfigContext } from "../context/ConfigContext";

/**
 * useConfig — consume the ConfigContext.
 *
 * Kept in its own file so Vite Fast Refresh can handle this hook module
 * independently from the ConfigProvider component module.
 */
export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used inside ConfigProvider");
  return ctx;
}
