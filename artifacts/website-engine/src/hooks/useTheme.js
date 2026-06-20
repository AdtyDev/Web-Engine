import { useEffect } from "react";

const RADIUS_MAP = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
};

const FONT_LINK_ID = "gf-fonts";

/**
 * Applies config.theme values as CSS custom properties on <html>.
 * All Tailwind and inline styles throughout the app reference these vars.
 *
 * Google Fonts are loaded via a single <link id="gf-fonts"> element that is
 * created once and its href updated in place — never duplicated across re-renders.
 */
export function useTheme(theme) {
  // Both useEffect calls must always be called (no early returns before them).
  // Guards inside handle the null/undefined theme case.
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty("--color-primary", theme.primary_color || "#2563eb");
    root.style.setProperty("--color-secondary", theme.secondary_color || "#64748b");
    root.style.setProperty("--color-accent", theme.accent_color || "#f59e0b");
    root.style.setProperty("--font-heading", `'${theme.font_heading}', serif`);
    root.style.setProperty("--font-body", `'${theme.font_body}', sans-serif`);
    root.style.setProperty("--radius", RADIUS_MAP[theme.border_radius] ?? "0.5rem");
  }, [
    theme?.primary_color,
    theme?.secondary_color,
    theme?.accent_color,
    theme?.font_heading,
    theme?.font_body,
    theme?.border_radius,
  ]);

  useEffect(() => {
    const heading = theme?.font_heading;
    const body = theme?.font_body;
    if (!heading && !body) return;

    const uniqueFonts = [...new Set([heading, body].filter(Boolean))];
    const families = uniqueFonts
      .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    let link = document.getElementById(FONT_LINK_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = FONT_LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [theme?.font_heading, theme?.font_body]);
}
