import { useState } from "react";

/** FAQ section — skeleton placeholder. Full implementation in Phase 5. */
export function FAQ({ section }) {
  const [open, setOpen] = useState(null);
  if (!section?.enabled) return null;

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <div className="space-y-3">
          {section.items?.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-[var(--radius)] overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 font-medium flex justify-between items-center hover:bg-gray-50"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {item.q}
                <span>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-gray-600 text-sm">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
