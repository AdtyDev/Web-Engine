/**
 * Footer — skeleton placeholder.
 * Full implementation in Phase 4.
 */
export function Footer({ config }) {
  const { meta, contact } = config ?? {};
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="font-semibold text-white mb-1">{meta?.business_name}</p>
        <p className="text-sm">{contact?.address}</p>
        <p className="text-sm mt-1">
          {contact?.phone} · {contact?.email}
        </p>
        <p className="text-xs mt-4 text-gray-600">
          © {new Date().getFullYear()} {meta?.business_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
