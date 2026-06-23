import { useState } from "react";

/**
 * Gallery section — full Phase 3 implementation.
 *
 * Features:
 *  - Masonry-lite grid (2 cols mobile → 4 cols desktop)
 *  - Lightbox on click (keyboard accessible, Esc to close)
 */
function Lightbox({ src, alt, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={-1}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function Gallery({ section }) {
  const [lightbox, setLightbox] = useState(null);

  if (!section?.enabled) return null;

  const images = section.images ?? [];

  return (
    <section id="gallery" className="py-20 md:py-28 bg-white">
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

        {images.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No gallery images configured.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((src, i) => (
              <button
                key={i}
                className="aspect-square bg-gray-100 rounded-[var(--radius)] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] group"
                onClick={() => setLightbox({ src, alt: `Gallery image ${i + 1}` })}
                aria-label={`View gallery image ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}
