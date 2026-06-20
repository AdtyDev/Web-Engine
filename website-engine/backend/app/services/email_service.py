"""
Email service.

Behaviour:
  - If SMTP_HOST is configured → send via smtplib (TLS on port 587 by default).
  - If SMTP_HOST is blank (dev default) → log to console only.

This design means dev environments never need SMTP configured,
and prod environments just set the four SMTP_* env vars.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.settings import settings

logger = logging.getLogger(__name__)


def send_contact_email(name: str, email: str, phone: str | None, message: str) -> None:
    """
    Send a contact form submission email, or log it to console in dev.

    Raises: smtplib.SMTPException (caller should handle gracefully in Phase 6).
    """
    body = _build_body(name, email, phone, message)

    if not settings.smtp_host:
        # Dev / no-SMTP fallback — log instead of sending
        logger.info(
            "CONTACT FORM [dev — SMTP not configured]\n"
            "  From:    %s <%s>\n"
            "  Phone:   %s\n"
            "  Message: %s",
            name, email, phone or "—", message,
        )
        return

    _send_via_smtp(
        to=settings.smtp_to,
        subject=f"[Website Engine] Contact form: {name}",
        body=body,
    )
    logger.info("Contact email sent from %s <%s>", name, email)


def _build_body(name: str, email: str, phone: str | None, message: str) -> str:
    lines = [
        f"Name:    {name}",
        f"Email:   {email}",
        f"Phone:   {phone or '—'}",
        "",
        "Message:",
        message,
    ]
    return "\n".join(lines)


def _send_via_smtp(to: str, subject: str, body: str) -> None:
    msg = MIMEMultipart()
    msg["From"] = settings.smtp_from
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_pass)
        server.sendmail(settings.smtp_from, to, msg.as_string())
