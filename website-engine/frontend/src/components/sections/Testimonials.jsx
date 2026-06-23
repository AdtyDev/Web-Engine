/**
 * Testimonials section — full Phase 3 implementation.
 *
 * Features:
 *  - Star rating display (1–5)
 *  - Avatar initials when no photo provided
 *  - Alternating light/brand-tinted cards on featured items
 */

function Stars({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-4 h-4 ${n <= rating ? "text-yellow-400" : "text-gray-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, photo }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
        loading="lazy"
      />
    );
  }
  const initials = name
    ?.trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
      style={{ background: "var(--color-primary)" }}
    >
      {initials}
    </div>
  );
}

export function Testimonials({ section }) {
  if (!section?.enabled) return null;

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          {section.subtitle && (
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--color-primary)" }}
            >
              {section.subtitle}
            </p>
          )}
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {section.title}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((t, i) => (
            <blockquote
              key={i}
              className="bg-white rounded-[var(--radius)] p-6 border border-gray-100 shadow-sm flex flex-col"
            >
              <Stars rating={t.rating} />
              <p className="text-gray-700 leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <footer className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                <Avatar name={t.name} photo={t.photo} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
