/** Hero section — skeleton placeholder. Full implementation in Phase 5. */
export function Hero({ section }) {
  if (!section?.enabled) return null;
  return (
    <section id="hero" className="relative flex items-center justify-center min-h-screen bg-gray-800 text-white text-center px-4">
      {section.background_image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${section.background_image})` }}
        />
      )}
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          {section.headline}
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">{section.subheadline}</p>
        {section.cta_text && (
          <a
            href={section.cta_link}
            className="inline-block px-8 py-3 rounded-[var(--radius)] font-semibold bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            {section.cta_text}
          </a>
        )}
      </div>
    </section>
  );
}
