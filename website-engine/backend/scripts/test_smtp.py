"""
SMTP connectivity smoke-test.

Usage (from website-engine/backend/):
    python scripts/test_smtp.py

What it does:
  1. Loads settings from .env (or environment variables).
  2. Checks all five required SMTP vars are present.
  3. Opens an SMTP connection and authenticates.
  4. Sends a test email to SMTP_TO and prints the result.

Exit codes:
  0 — connection OK and email sent (or logged, if SMTP not configured).
  1 — configuration error (missing vars).
  2 — SMTP connection / authentication error.
  3 — Unexpected error.

Run this before deploying to confirm your SMTP credentials work end-to-end.
"""
import sys
import textwrap

# Allow running from the backend root without installing the package.
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.settings import settings   # noqa: E402  (must come after sys.path tweak)
from app.services.email_service import send_contact_email  # noqa: E402


def _banner(char: str, text: str) -> str:
    width = 60
    line = char * width
    return f"\n{line}\n  {text}\n{line}"


def main() -> int:
    print(_banner("─", "website-engine SMTP smoke-test"))

    # ── 1. Show current config ────────────────────────────────────────────────
    print(f"\n  CLIENT_ID  : {settings.client_id}")
    print(f"  ENV        : {settings.env}")
    print(f"  SMTP_HOST  : {settings.smtp_host or '(not set)'}")
    print(f"  SMTP_PORT  : {settings.smtp_port}")
    print(f"  SMTP_SSL   : {settings.smtp_ssl}")
    print(f"  SMTP_USER  : {settings.smtp_user or '(not set)'}")
    print(f"  SMTP_PASS  : {'*' * len(settings.smtp_pass) if settings.smtp_pass else '(not set)'}")
    print(f"  SMTP_FROM  : {settings.smtp_from or '(not set)'}")
    print(f"  SMTP_TO    : {settings.smtp_to or '(not set)'}")
    print(f"  SMTP_TIMEOUT: {settings.smtp_timeout}s")

    # ── 2. Check completeness ────────────────────────────────────────────────
    if not settings.smtp_enabled:
        required = {
            "SMTP_HOST": settings.smtp_host,
            "SMTP_USER": settings.smtp_user,
            "SMTP_PASS": settings.smtp_pass,
            "SMTP_FROM": settings.smtp_from,
            "SMTP_TO":   settings.smtp_to,
        }
        missing = [k for k, v in required.items() if not v]
        print(f"\n⚠️  SMTP is not fully configured.")
        print(f"   Missing: {', '.join(missing)}")
        print(
            "\n   Copy .env.example → .env and fill in the SMTP_* vars.\n"
            "   See the file for provider-specific examples (Gmail, SendGrid, Mailgun, SES)."
        )
        print("\n   In dev, submissions are printed to the console instead of emailed.\n")
        return 1

    # ── 3. Send test email ────────────────────────────────────────────────────
    print(f"\n🔌 Connecting to {settings.smtp_host}:{settings.smtp_port} …")

    import smtplib
    try:
        send_contact_email(
            name="SMTP Test",
            email=settings.smtp_from,
            phone=None,
            message=textwrap.dedent(f"""\
                This is an automated SMTP connectivity test from the website-engine.

                If you received this message, your SMTP configuration is working correctly.

                Configuration:
                  Host:    {settings.smtp_host}:{settings.smtp_port}
                  SSL:     {settings.smtp_ssl}
                  User:    {settings.smtp_user}
                  From:    {settings.smtp_from}
                  To:      {settings.smtp_to}
            """),
            business_name="website-engine (test)",
        )
    except smtplib.SMTPAuthenticationError as exc:
        print(f"\n❌ Authentication failed: {exc}")
        print(
            "\n   Check SMTP_USER and SMTP_PASS.\n"
            "   For Gmail, ensure you are using an App Password, not your account password.\n"
            "   For SendGrid, SMTP_USER must be the literal string 'apikey'."
        )
        return 2
    except smtplib.SMTPConnectError as exc:
        print(f"\n❌ Could not connect to {settings.smtp_host}:{settings.smtp_port}: {exc}")
        print(
            "\n   Check SMTP_HOST and SMTP_PORT.\n"
            "   For port 465, also set SMTP_SSL=true."
        )
        return 2
    except smtplib.SMTPException as exc:
        print(f"\n❌ SMTP error: {exc}")
        return 2
    except Exception as exc:  # noqa: BLE001
        print(f"\n❌ Unexpected error: {exc}")
        return 3

    print(f"\n✅ Test email sent successfully to {settings.smtp_to}")
    print("   Check your inbox — it may take a moment to arrive.")
    print("   Also check your spam folder if it doesn't appear.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
