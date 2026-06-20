/** Pricing section — skeleton placeholder. Full implementation in Phase 5. */
export function Pricing({ section }) {
  if (!section?.enabled) return null;
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {section.plans?.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[var(--radius)] border p-6 ${plan.featured ? "border-[var(--color-primary)] shadow-lg" : "border-gray-200 bg-white"}`}
            >
              {plan.featured && (
                <span className="text-xs font-bold uppercase text-[var(--color-primary)] tracking-wider">Best Value</span>
              )}
              <h3 className="font-bold text-xl mt-1 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <p className="text-3xl font-bold">
                {plan.currency} {plan.price.toLocaleString("en-IN")}
                <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features?.map((f, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
