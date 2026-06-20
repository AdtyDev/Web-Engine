import { useEffect } from "react";

const RADIUS_MAP = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
};

/**
 * Applies config.theme values as CSS custom properties on <html>.
 * All Tailwind classes throughout the app reference these vars,
 * never hardcoded hex values.
 */
export function useTheme(theme) {
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.primary_color);
    root.style.setProperty("--color-secondary", theme.secondary_color);
    root.style.setProperty("--color-accent", theme.accent_color);
    root.style.setProperty("--font-heading", `'${theme.font_heading}', serif`);
    root.style.setProperty("--font-body", `'${theme.font_body}', sans-serif`);
    root.style.setProperty("--radius", RADIUS_MAP[theme.border_radius] ?? "0.5rem");

    // Load Google Fonts dynamically
    const fonts = [...new Set([theme.font_heading, theme.font_body])].join("&family=");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fonts}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [theme]);
}
