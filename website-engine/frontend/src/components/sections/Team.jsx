/**
 * Team section — full Phase 3 implementation.
 * Shows member cards with photo, name, role, bio, and optional qualifications.
 */

function Initials({ name }) {
  const parts = name?.trim().split(/\s+/) ?? [];
  const initials = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? "?");
  return (
    <div
      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold select-none"
      style={{ background: "var(--color-primary)" }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

export function Team({ section }) {
  if (!section?.enabled) return null;

  return (
    <section id="team" className="py-20 md:py-28 bg-gray-50">
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

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {section.members?.map((m, i) => (
            <div
              key={i}
              className="bg-white rounded-[var(--radius)] border border-gray-200 p-6 text-center hover:shadow-md transition-shadow"
            >
              {m.photo ? (
                <img
                  src={m.photo}
                  alt={m.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-2 ring-gray-100"
                  loading="lazy"
                />
              ) : (
                <Initials name={m.name} />
              )}
              <h3 className="font-semibold text-lg text-gray-900">{m.name}</h3>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--color-primary)" }}>
                {m.role}
              </p>
              {m.qualifications?.length > 0 && (
                <p className="text-xs text-gray-400 mb-3">{m.qualifications.join(" · ")}</p>
              )}
              {m.bio && <p className="text-sm text-gray-500 leading-relaxed">{m.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
