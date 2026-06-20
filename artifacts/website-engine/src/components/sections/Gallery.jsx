/** Gallery section — skeleton placeholder. Full implementation in Phase 5. */
export function Gallery({ section }) {
  if (!section?.enabled) return null;
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {section.images?.map((src, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-[var(--radius)] overflow-hidden">
              <img src={src} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
