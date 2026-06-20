/** Testimonials section — skeleton placeholder. Full implementation in Phase 5. */
export function Testimonials({ section }) {
  if (!section?.enabled) return null;
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((t, i) => (
            <blockquote key={i} className="bg-gray-50 rounded-[var(--radius)] p-6 border border-gray-100">
              <p className="text-gray-700 italic mb-4">"{t.text}"</p>
              <footer className="text-sm font-semibold text-[var(--color-primary)]">— {t.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
