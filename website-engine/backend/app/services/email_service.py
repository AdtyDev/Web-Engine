"""
Email service — sends via SMTP when configured, falls back to console logging in dev.
Implemented in Phase 6.
"""
import logging

logger = logging.getLogger(__name__)


def send_contact_email(name: str, email: str, phone: str | None, message: str) -> None:
    """Send a contact form submission. Placeholder — implemented in Phase 6."""
    logger.info(
        "CONTACT FORM [dev stub] name=%s email=%s phone=%s message=%s",
        name, email, phone, message,
    )
