/**
 * Hero section — full Phase 3 implementation.
 *
 * Features:
 *  - Full-viewport height with optional background image (parallax-lite via bg-fixed)
 *  - Gradient overlay that uses CSS theme vars
 *  - Animated fade-in entrance
 *  - CTA button scrolls smooth to target section
 *  - Secondary CTA support
 */
export function Hero({ section }) {
  if (!section?.enabled) return null;

  const handleCta = (e, link) => {
    if (!link?.startsWith("#")) return;
    e.preventDefault();
    const target = document.getElementById(link.slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      className="relative flex items-center justify-center min-h-screen text-white text-center px-4 overflow-hidden"
      style={{ background: "var(--color-primary)" }}
    >
      {/* Background image */}
      {section.background_image && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${section.background_image})` }}
        />
      )}

      {/* Overlay — always present; darker when there's no image to keep text readable */}
      <div
        className="absolute inset-0"
        style={{
          background: section.background_image
            ? "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.65))"
            : "linear-gradient(135deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35))",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl animate-[fadeIn_0.8s_ease_both]">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          style={{ fontFamily: "var(--font-heading)", textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
        >
          {section.headline}
        </h1>
        {section.subheadline && (
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            {section.subheadline}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {section.cta_text && (
            <a
              href={section.cta_link || "#contact"}
              onClick={(e) => handleCta(e, section.cta_link)}
              className="inline-block px-8 py-3.5 rounded-[var(--radius)] font-semibold bg-white hover:bg-gray-100 transition-colors shadow-lg"
              style={{ color: "var(--color-primary)" }}
            >
              {section.cta_text}
            </a>
          )}
          {section.cta2_text && (
            <a
              href={section.cta2_link || "#about"}
              onClick={(e) => handleCta(e, section.cta2_link)}
              className="inline-block px-8 py-3.5 rounded-[var(--radius)] font-semibold border-2 border-white/70 text-white hover:bg-white/10 transition-colors"
            >
              {section.cta2_text}
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-60 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
