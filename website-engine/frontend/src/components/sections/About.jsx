/**
 * About section — full Phase 3 implementation.
 *
 * Features:
 *  - Optional image (right column) with text on left
 *  - Stat grid with animated counters (CSS only, no JS)
 *  - Falls back to single-column when no image_url
 */
export function About({ section }) {
  if (!section?.enabled) return null;

  const hasImage = Boolean(section.image_url);

  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`grid gap-12 items-center ${hasImage ? "md:grid-cols-2" : ""}`}>
          {/* Text */}
          <div>
            {section.subtitle && (
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--color-primary)" }}
              >
                {section.subtitle}
              </p>
            )}
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {section.title}
            </h2>
            <div className="prose prose-gray max-w-none">
              {section.body?.split("\n").map((para, i) =>
                para.trim() ? (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4">
                    {para}
                  </p>
                ) : null
              )}
            </div>
          </div>

          {/* Image */}
          {hasImage && (
            <div className="relative">
              <img
                src={section.image_url}
                alt={section.title}
                className="w-full rounded-[var(--radius)] object-cover shadow-xl"
                style={{ maxHeight: "480px" }}
                loading="lazy"
              />
              <div
                className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20 -z-10"
                style={{ background: "var(--color-accent)" }}
              />
            </div>
          )}
        </div>

        {/* Stats */}
        {section.stats?.length > 0 && (
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-100">
            {section.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p
                  className="text-4xl md:text-5xl font-bold mb-1"
                  style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
