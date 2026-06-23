import { useEffect, useRef, useState } from "react";

/**
 * Navbar — config-driven, fully responsive.
 *
 * Features:
 *  - Logo image from config.meta.logo_url, with business name as text fallback.
 *  - Nav links driven from config.navigation.
 *  - Mobile hamburger (hidden on md+) with slide-down menu.
 *  - Active section highlighted via IntersectionObserver.
 *  - Background becomes white + shadow once the user scrolls past the hero.
 *  - Smooth scroll on link click; closes mobile menu automatically.
 */
export function Navbar({ config }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef(null);

  const nav = config?.navigation ?? [];
  const meta = config?.meta ?? {};

  // Scroll-aware background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section via IntersectionObserver
  useEffect(() => {
    if (!nav.length) return;

    observerRef.current?.disconnect();

    const targets = nav
      .map((item) => document.getElementById(item.section))
      .filter(Boolean);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [nav]);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm border-b border-gray-100" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, "hero")}
            className="flex items-center gap-2 shrink-0"
          >
            {meta.logo_url ? (
              <img
                src={meta.logo_url}
                alt={meta.business_name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span
                className="font-bold text-lg text-gray-900"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {meta.business_name}
              </span>
            )}
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const isActive = activeSection === item.section;
              return (
                <li key={item.section}>
                  <a
                    href={`#${item.section}`}
                    onClick={(e) => handleNavClick(e, item.section)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                        : "text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <ul className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {nav.map((item) => {
              const isActive = activeSection === item.section;
              return (
                <li key={item.section}>
                  <a
                    href={`#${item.section}`}
                    onClick={(e) => handleNavClick(e, item.section)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                        : "text-gray-700 hover:text-[var(--color-primary)] hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
