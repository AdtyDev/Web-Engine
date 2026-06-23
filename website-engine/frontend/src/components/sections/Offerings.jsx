/**
 * Offerings section — services / menu items / programs.
 * The `type` field determines the display label:
 *   "services" → clinic / gym
 *   "menu"     → restaurant
 *   "programs" → generic
 */

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function formatPrice(price, currency) {
  if (price == null) return null;
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${price.toLocaleString("en-IN")}`;
}

export function Offerings({ section }) {
  if (!section?.enabled) return null;

  return (
    <section id="offerings" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
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
          {section.items?.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-[var(--radius)] border p-6 flex flex-col transition-shadow hover:shadow-md ${
                item.featured ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]" : "border-gray-200"
              }`}
            >
              {item.featured && (
                <span
                  className="text-xs font-bold uppercase tracking-widest mb-3 self-start px-2 py-0.5 rounded-full"
                  style={{
                    color: "var(--color-primary)",
                    background: "color-mix(in srgb, var(--color-primary) 12%, white)",
                  }}
                >
                  Popular
                </span>
              )}
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-[calc(var(--radius)_-_4px)] mb-4 -mx-0"
                  loading="lazy"
                />
              )}
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
              {item.description && (
                <p className="text-gray-500 text-sm flex-1 leading-relaxed">{item.description}</p>
              )}
              {formatPrice(item.price, item.currency) && (
                <p
                  className="mt-4 text-lg font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {formatPrice(item.price, item.currency)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
