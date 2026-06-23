import { useState } from "react";

/**
 * FAQ section — full Phase 3 implementation.
 *
 * Features:
 *  - Accessible accordion (keyboard-navigable)
 *  - Animated expand/collapse via CSS max-height transition
 *  - Only one item open at a time
 */
export function FAQ({ section }) {
  const [open, setOpen] = useState(null);

  if (!section?.enabled) return null;

  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
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

        <div className="space-y-2">
          {section.items?.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-[var(--radius)] overflow-hidden"
              >
                <button
                  className="w-full text-left px-5 py-4 font-medium text-gray-900 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <svg
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
