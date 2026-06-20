/**
 * Navbar — skeleton placeholder.
 * Full implementation in Phase 4.
 */
export function Navbar({ config }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
          {config?.meta?.business_name ?? ""}
        </span>
        <ul className="hidden md:flex gap-6 text-sm">
          {(config?.navigation ?? []).map((item) => (
            <li key={item.section}>
              <a
                href={`#${item.section}`}
                className="text-gray-600 hover:text-[var(--color-primary)] transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
