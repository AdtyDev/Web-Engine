/** About section — skeleton placeholder. Full implementation in Phase 5. */
export function About({ section }) {
  if (!section?.enabled) return null;
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <p className="text-gray-600 max-w-3xl">{section.body}</p>
        {section.stats?.length > 0 && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {section.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-[var(--color-primary)]">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
