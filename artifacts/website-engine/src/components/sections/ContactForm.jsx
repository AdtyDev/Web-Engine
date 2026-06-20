import { useState } from "react";
import { postContact } from "../../api/client";

/**
 * Contact section — full Phase 3 implementation.
 *
 * Features:
 *  - Contact info column (phone, email, address, hours, map embed)
 *  - Form column with honeypot, loading state, success/error feedback
 *  - Map embed via config.contact.map_embed_url (shown below form on mobile)
 */

function ContactInfoRow({ icon, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }}>
        {icon}
      </span>
      <span className="text-gray-600 text-sm">{children}</span>
    </div>
  );
}

const PhoneIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);
const EmailIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
);
const LocationIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);
const ClockIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

export function ContactForm({ section, contactConfig }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    honeypot: "",
  });

  if (!section?.enabled) return null;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
    <section id="contact" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section heading */}
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

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact info */}
          <div className="space-y-5">
            {contactConfig?.phone && (
              <ContactInfoRow icon={PhoneIcon}>
                <a href={`tel:${contactConfig.phone}`} className="hover:underline">
                  {contactConfig.phone}
                </a>
              </ContactInfoRow>
            )}
            {contactConfig?.email && (
              <ContactInfoRow icon={EmailIcon}>
                <a href={`mailto:${contactConfig.email}`} className="hover:underline">
                  {contactConfig.email}
                </a>
              </ContactInfoRow>
            )}
            {contactConfig?.address && (
              <ContactInfoRow icon={LocationIcon}>{contactConfig.address}</ContactInfoRow>
            )}
            {contactConfig?.hours?.length > 0 && (
              <ContactInfoRow icon={ClockIcon}>
                <div className="space-y-1">
                  {contactConfig.hours.map((h, i) => (
                    <p key={i}>
                      <span className="font-medium text-gray-700">{h.day}:</span>{" "}
                      {h.time}
                    </p>
                  ))}
                </div>
              </ContactInfoRow>
            )}

            {contactConfig?.map_embed_url && (
              <div className="mt-6 rounded-[var(--radius)] overflow-hidden border border-gray-200 aspect-video">
                <iframe
                  src={contactConfig.map_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location map"
                />
              </div>
            )}
          </div>

          {/* Form */}
          {section.show_form && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Honeypot — hidden from humans, filled by bots */}
              <input
                type="text"
                name="honeypot"
                value={form.honeypot}
                onChange={handleChange}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {[
                { name: "name", label: "Name", type: "text", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "phone", label: "Phone", type: "tel", required: false },
              ].map(({ name, label, type, required }) => (
                <div key={name}>
                  <label
                    htmlFor={`cf-${name}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={`cf-${name}`}
                    name={name}
                    type={type}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                    className="w-full border border-gray-300 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="cf-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cf-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full border border-gray-300 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-shadow"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 rounded-[var(--radius)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: "var(--color-primary)" }}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  section.submit_label || "Send Message"
                )}
              </button>

              {status === "success" && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-[var(--radius)] text-green-700 text-sm">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Message sent! We'll be in touch soon.
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[var(--radius)] text-red-700 text-sm">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Something went wrong. Please try again or call us directly.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
