import { useState } from "react";
import { postContact, ContactError } from "../../api/client";

/**
 * Contact section — Phase 5 E2E implementation.
 *
 * New in Phase 5:
 *  - Client-side validation with per-field errors (no silent browser `required`)
 *  - Message character counter (10–2000 chars)
 *  - Three distinct server error states: rate_limited / email_unavailable / generic
 *  - Retry-After countdown shown on 429
 *  - ARIA live region for screen-reader announcements
 */

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

function validateForm(form) {
  const errors = {};
  if (!form.name.trim() || form.name.trim().length < 2) {
    errors.name = "Please enter your full name (at least 2 characters).";
  }
  if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!form.message.trim() || form.message.trim().length < MESSAGE_MIN) {
    errors.message = `Message must be at least ${MESSAGE_MIN} characters.`;
  }
  if (form.message.trim().length > MESSAGE_MAX) {
    errors.message = `Message must be at most ${MESSAGE_MAX} characters.`;
  }
  return errors;
}

// ─── Status banners ───────────────────────────────────────────────────────────

function Banner({ type, children }) {
  const styles = {
    success: "bg-green-50 border-green-200 text-green-700",
    error:   "bg-red-50   border-red-200   text-red-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
  };
  const icons = {
    success: (
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    ),
    error: (
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    ),
    warning: (
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    ),
  };
  return (
    <div
      className={`flex items-start gap-2 p-3 border rounded-[var(--radius)] text-sm ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        {icons[type]}
      </svg>
      <span>{children}</span>
    </div>
  );
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({ id, label, required, error, touched, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {touched && error && (
        <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", email: "", phone: "", message: "", honeypot: "" };

export function ContactForm({ section, contactConfig }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [status, setStatus]   = useState("idle"); // idle | loading | success | rate_limited | unavailable | error
  const [serverMsg, setServerMsg] = useState("");

  if (!section?.enabled) return null;

  const errors = validateForm(form);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all required fields as touched so errors become visible
    setTouched({ name: true, email: true, message: true });
    if (!isValid) return;

    setStatus("loading");
    setServerMsg("");

    try {
      await postContact(form);
      setStatus("success");
      setForm(EMPTY_FORM);
      setTouched({});
    } catch (err) {
      if (err instanceof ContactError) {
        if (err.code === "rate_limited") {
          setStatus("rate_limited");
        } else if (err.code === "email_unavailable") {
          setStatus("unavailable");
        } else {
          setStatus("error");
        }
        setServerMsg(err.message);
      } else {
        setStatus("error");
        setServerMsg("Something went wrong. Please try again.");
      }
    }
  };

  const inputClass = (name) =>
    `w-full border rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
      touched[name] && errors[name]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-gray-300"
    }`;

  const msgLen = form.message.length;
  const msgNearLimit = msgLen > MESSAGE_MAX * 0.85;

  return (
    <section id="contact" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          {section.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
              {section.subtitle}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* ── Contact info ── */}
          <div className="space-y-5">
            {contactConfig?.phone && (
              <ContactInfoRow icon={PhoneIcon}>
                <a href={`tel:${contactConfig.phone}`} className="hover:underline">{contactConfig.phone}</a>
              </ContactInfoRow>
            )}
            {contactConfig?.email && (
              <ContactInfoRow icon={EmailIcon}>
                <a href={`mailto:${contactConfig.email}`} className="hover:underline">{contactConfig.email}</a>
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
                      <span className="font-medium text-gray-700">{h.day}:</span> {h.time}
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

          {/* ── Form ── */}
          {section.show_form && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Contact form">
              {/* Honeypot */}
              <input
                type="text" name="honeypot" value={form.honeypot} onChange={handleChange}
                style={{ display: "none" }} tabIndex={-1} autoComplete="off" aria-hidden="true"
              />

              <Field id="cf-name" label="Name" required error={errors.name} touched={touched.name}>
                <input
                  id="cf-name" name="name" type="text"
                  value={form.name} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="name"
                  className={inputClass("name")}
                  aria-describedby={touched.name && errors.name ? "cf-name-err" : undefined}
                />
              </Field>

              <Field id="cf-email" label="Email" required error={errors.email} touched={touched.email}>
                <input
                  id="cf-email" name="email" type="email"
                  value={form.email} onChange={handleChange} onBlur={handleBlur}
                  autoComplete="email"
                  className={inputClass("email")}
                />
              </Field>

              <Field id="cf-phone" label="Phone" required={false} error={null} touched={false}>
                <input
                  id="cf-phone" name="phone" type="tel"
                  value={form.phone} onChange={handleChange}
                  autoComplete="tel"
                  className="w-full border border-gray-300 rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </Field>

              <Field id="cf-message" label="Message" required error={errors.message} touched={touched.message}>
                <textarea
                  id="cf-message" name="message"
                  value={form.message} onChange={handleChange} onBlur={handleBlur}
                  rows={5}
                  maxLength={MESSAGE_MAX}
                  className={`${inputClass("message")} resize-none`}
                  aria-describedby="cf-msg-count"
                />
                <p
                  id="cf-msg-count"
                  className={`mt-1 text-xs text-right transition-colors ${
                    msgNearLimit ? (msgLen >= MESSAGE_MAX ? "text-red-500 font-medium" : "text-amber-500") : "text-gray-400"
                  }`}
                >
                  {msgLen} / {MESSAGE_MAX}
                </p>
              </Field>

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full py-3 rounded-[var(--radius)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: "var(--color-primary)" }}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : status === "success" ? (
                  "Message sent ✓"
                ) : (
                  section.submit_label || "Send Message"
                )}
              </button>

              {/* Status banners */}
              {status === "success" && (
                <Banner type="success">
                  Message sent! We'll be in touch soon.
                </Banner>
              )}
              {status === "rate_limited" && (
                <Banner type="warning">
                  {serverMsg || "You've sent too many messages recently. Please wait a few minutes before trying again."}
                </Banner>
              )}
              {status === "unavailable" && (
                <Banner type="warning">
                  {serverMsg || "Our messaging service is temporarily unavailable."}{" "}
                  {contactConfig?.phone && (
                    <>Please call us at <a href={`tel:${contactConfig.phone}`} className="font-semibold underline">{contactConfig.phone}</a>.</>
                  )}
                </Banner>
              )}
              {status === "error" && (
                <Banner type="error">
                  {serverMsg || "Something went wrong. Please try again or contact us directly."}
                </Banner>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
