"""
Email service — Phase 5 E2E implementation.

Behaviour:
  - All five SMTP_* vars set  → send via smtplib (STARTTLS on 587, or SSL on 465).
  - Any var missing / SMTP_HOST blank → log submission to console (dev default).

Connection strategy:
  - SMTP_SSL=false (default) → SMTP + STARTTLS (port 587, most providers)
  - SMTP_SSL=true            → SMTP_SSL wrapper   (port 465, some legacy setups)

The caller (contact.py) must catch `smtplib.SMTPException` and return 503.

Raises: smtplib.SMTPException on any SMTP-level failure.
"""
import logging
import smtplib
import textwrap
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.settings import settings

logger = logging.getLogger(__name__)


def send_contact_email(
    name: str,
    email: str,
    phone: str | None,
    message: str,
    *,
    business_name: str = "",
) -> None:
    """
    Send a contact-form submission email, or log it to console in dev.

    Args:
        name:           Submitter's name.
        email:          Submitter's email address.
        phone:          Optional phone number.
        message:        The body of the message.
        business_name:  Optional client business name for the subject line.

    Raises:
        smtplib.SMTPException: on any SMTP-level failure (caller handles → 503).
    """
    plain, html = _build_body(name, email, phone, message, business_name)
    subject = _build_subject(name, business_name)

    if not settings.smtp_enabled:
        logger.info(
            "CONTACT FORM [dev — SMTP not configured]\n"
            "  From:    %s <%s>\n"
            "  Phone:   %s\n"
            "  Message:\n%s",
            name, email, phone or "—",
            textwrap.indent(message, "    "),
        )
        return

    _send_via_smtp(subject=subject, plain=plain, html=html)
    logger.info("Contact email sent — from %s <%s> to %s", name, email, settings.smtp_to)


# ─── Internal helpers ─────────────────────────────────────────────────────────

def _build_subject(name: str, business_name: str) -> str:
    prefix = f"[{business_name}]" if business_name else "[Contact Form]"
    return f"{prefix} Message from {name}"


def _build_body(
    name: str,
    email: str,
    phone: str | None,
    message: str,
    business_name: str,
) -> tuple[str, str]:
    """Return (plain_text, html) for the email body."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # ── Plain text ──
    plain = "\n".join([
        f"Name:    {name}",
        f"Email:   {email}",
        f"Phone:   {phone or '—'}",
        f"Sent:    {ts}",
        "",
        "Message",
        "───────",
        message,
        "",
        "─────────────────────────────────────────",
        f"This message was submitted via the contact form on {business_name or 'your website'}.",
    ])

    # ── HTML ──
    safe = {
        "name":    _esc(name),
        "email":   _esc(email),
        "phone":   _esc(phone or "—"),
        "message": _esc(message).replace("\n", "<br>"),
        "ts":      _esc(ts),
        "site":    _esc(business_name or "your website"),
    }
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contact form submission</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0"
           style="background:#ffffff;border-radius:8px;overflow:hidden;
                  box-shadow:0 1px 4px rgba(0,0,0,.08);max-width:100%;">
      <!-- Header -->
      <tr>
        <td style="background:#1e3a5f;padding:24px 32px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:bold;">
            📬 New Contact Form Message
          </p>
          <p style="margin:4px 0 0;color:#a8c4e0;font-size:13px;">{safe["site"]}</p>
        </td>
      </tr>
      <!-- Details -->
      <tr>
        <td style="padding:28px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            {_row("Name",  safe["name"])}
            {_row("Email", f'<a href="mailto:{safe["email"]}" style="color:#1e3a5f;">{safe["email"]}</a>')}
            {_row("Phone", safe["phone"])}
            {_row("Sent",  safe["ts"])}
          </table>
        </td>
      </tr>
      <!-- Message body -->
      <tr>
        <td style="padding:20px 32px 28px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:bold;
                    text-transform:uppercase;letter-spacing:.05em;color:#64748b;">
            Message
          </p>
          <div style="background:#f8fafc;border-left:4px solid #1e3a5f;
                      border-radius:4px;padding:16px 20px;
                      font-size:15px;line-height:1.6;color:#1e293b;">
            {safe["message"]}
          </div>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:0 32px 24px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            This message was submitted via the contact form on {safe["site"]}.
            Do not reply directly to this email — reply to
            <a href="mailto:{safe["email"]}" style="color:#1e3a5f;">{safe["email"]}</a> instead.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>"""

    return plain, html


def _row(label: str, value: str) -> str:
    return (
        f'<tr>'
        f'<td style="width:80px;padding:0 12px 12px 0;font-size:13px;'
        f'color:#64748b;font-weight:bold;vertical-align:top;">{label}</td>'
        f'<td style="padding:0 0 12px;font-size:14px;color:#1e293b;">{value}</td>'
        f'</tr>'
    )


def _esc(s: str) -> str:
    """Minimal HTML escaping — covers the chars that matter in email bodies."""
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
         .replace('"', "&quot;")
    )


def _send_via_smtp(subject: str, plain: str, html: str) -> None:
    """
    Send a multipart/alternative email via SMTP.

    Respects SMTP_SSL (True → SSL wrapper, False → STARTTLS) and SMTP_TIMEOUT.
    Raises smtplib.SMTPException on any failure.
    """
    msg = MIMEMultipart("alternative")
    msg["From"]    = settings.smtp_from
    msg["To"]      = settings.smtp_to
    msg["Subject"] = subject
    msg["X-Mailer"] = "website-engine/1.0"

    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html,  "html",  "utf-8"))

    smtp_cls = smtplib.SMTP_SSL if settings.smtp_ssl else smtplib.SMTP
    with smtp_cls(settings.smtp_host, settings.smtp_port, timeout=settings.smtp_timeout) as server:
        if not settings.smtp_ssl:
            server.starttls()
        server.login(settings.smtp_user, settings.smtp_pass)
        server.sendmail(settings.smtp_from, settings.smtp_to.split(","), msg.as_string())
