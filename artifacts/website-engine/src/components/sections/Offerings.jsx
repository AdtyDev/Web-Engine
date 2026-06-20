/** Offerings section (services / menu / programs) — skeleton placeholder. Full implementation in Phase 5. */
export function Offerings({ section }) {
  if (!section?.enabled) return null;
  return (
    <section id="offerings" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items?.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[var(--radius)] border border-gray-200 p-6"
            >
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
              {item.price != null && (
                <p className="mt-3 font-bold text-[var(--color-primary)]">
                  {item.currency} {item.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
