/**
 * Pricing section — full Phase 3 implementation.
 *
 * Features:
 *  - Featured plan gets an accent ring + "Best Value" badge
 *  - Per-period label (monthly, yearly, per session, etc.)
 *  - CTA button per plan
 */

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function formatPrice(price, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency ?? "";
  return `${symbol}${price.toLocaleString("en-IN")}`;
}

export function Pricing({ section }) {
  if (!section?.enabled) return null;

  const handleCta = (e, link) => {
    if (!link?.startsWith("#")) return;
    e.preventDefault();
    document.getElementById(link.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
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

        <div className={`grid gap-6 ${
          section.plans?.length <= 2
            ? "sm:grid-cols-2 max-w-2xl mx-auto"
            : section.plans?.length === 3
            ? "sm:grid-cols-3 max-w-4xl mx-auto"
            : "sm:grid-cols-2 lg:grid-cols-4"
        }`}>
          {section.plans?.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[var(--radius)] border p-6 flex flex-col relative ${
                plan.featured
                  ? "border-[var(--color-primary)] shadow-xl ring-1 ring-[var(--color-primary)]"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                  style={{ background: "var(--color-primary)" }}
                >
                  Best Value
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                )}
              </div>

              <div className="mb-6">
                <span
                  className="text-4xl font-bold"
                  style={{ color: plan.featured ? "var(--color-primary)" : "inherit" }}
                >
                  {formatPrice(plan.price, plan.currency)}
                </span>
                {plan.period && (
                  <span className="text-sm text-gray-400 ml-1">/{plan.period}</span>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features?.map((f, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2 items-start">
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.cta_text && (
                <a
                  href={plan.cta_link || "#contact"}
                  onClick={(e) => handleCta(e, plan.cta_link)}
                  className={`block text-center py-2.5 rounded-[var(--radius)] text-sm font-semibold transition-opacity hover:opacity-90 ${
                    plan.featured
                      ? "text-white"
                      : "border border-[var(--color-primary)]"
                  }`}
                  style={
                    plan.featured
                      ? { background: "var(--color-primary)" }
                      : { color: "var(--color-primary)" }
                  }
                >
                  {plan.cta_text}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
