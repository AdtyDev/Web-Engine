import { useState } from "react";
import { postContact } from "../../api/client";

/** Contact form section — skeleton placeholder. Full implementation in Phase 6. */
export function ContactForm({ section, contactConfig }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", honeypot: "" });

  if (!section?.enabled) return null;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await postContact(form);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "", honeypot: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <p className="text-gray-600">{contactConfig?.phone}</p>
          <p className="text-gray-600">{contactConfig?.email}</p>
          <p className="text-gray-600 mt-1">{contactConfig?.address}</p>
          {contactConfig?.hours?.length > 0 && (
            <div className="mt-4">
              {contactConfig.hours.map((h, i) => (
                <p key={i} className="text-sm text-gray-500">{h.day}: {h.time}</p>
              ))}
            </div>
          )}
        </div>
        {section.show_form && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot — hidden from humans, filled by bots */}
            <input type="text" name="honeypot" value={form.honeypot} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                name="name" value={form.name} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full border border-gray-300 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone" value={form.phone} onChange={handleChange}
                className="w-full border border-gray-300 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                name="message" value={form.message} onChange={handleChange} required rows={4}
                className="w-full border border-gray-300 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-[var(--color-primary)] text-white py-2 rounded-[var(--radius)] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send Message"}
            </button>
            {status === "success" && (
              <p className="text-green-600 text-sm text-center">Message sent! We'll be in touch soon.</p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-sm text-center">Something went wrong. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
