/** Team section — skeleton placeholder. Full implementation in Phase 5. */
export function Team({ section }) {
  if (!section?.enabled) return null;
  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {section.members?.map((m, i) => (
            <div key={i} className="bg-white rounded-[var(--radius)] border border-gray-200 p-6 text-center">
              {m.photo && (
                <img src={m.photo} alt={m.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" loading="lazy" />
              )}
              <h3 className="font-semibold text-lg">{m.name}</h3>
              <p className="text-sm text-[var(--color-primary)] mb-2">{m.role}</p>
              <p className="text-sm text-gray-600">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
