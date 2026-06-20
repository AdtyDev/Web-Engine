import logging

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    client_id: str = "clinic"
    config_dir: str = "./configs"

    # Comma-separated list of allowed CORS origins.
    # In dev: "http://localhost:5173,http://localhost:3000"
    # In prod (PaaS): set to the actual frontend URL.
    # In prod (VPS/same-origin): can stay empty — not needed when frontend+backend share a domain.
    allowed_origins_raw: str = "http://localhost:5173,http://localhost:3000"

    env: str = "dev"

    # ── SMTP ────────────────────────────────────────────────────────────────
    # All optional; falls back to console logging when SMTP_HOST is unset.
    #
    # Port conventions:
    #   587  → STARTTLS (most providers; default)
    #   465  → SMTP over SSL/TLS — set SMTP_SSL=true
    #   25   → unencrypted (not recommended; use only on trusted internal networks)
    #
    # See .env.example for copy-paste blocks for Gmail, SendGrid, Mailgun, SES.
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from: str = ""   # "Sender Name <sender@example.com>" or plain address
    smtp_to: str = ""     # Recipient address(es) — comma-separated for multiple
    smtp_ssl: bool = False  # True → SSL/TLS wrapper (port 465); False → STARTTLS (port 587)
    smtp_timeout: int = 10  # Seconds before SMTP connection is abandoned

    # ── Rate limiting ────────────────────────────────────────────────────────
    contact_rate_limit_max: int = 5
    contact_rate_limit_window_seconds: int = 60

    @model_validator(mode="after")
    def warn_if_smtp_incomplete(self) -> "Settings":
        """
        If any SMTP credential is set but SMTP_HOST is missing (or vice-versa),
        log a clear warning at startup rather than failing silently at send-time.
        """
        required = {
            "SMTP_HOST": self.smtp_host,
            "SMTP_USER": self.smtp_user,
            "SMTP_PASS": self.smtp_pass,
            "SMTP_FROM": self.smtp_from,
            "SMTP_TO":   self.smtp_to,
        }
        provided = {k for k, v in required.items() if v}
        missing  = set(required) - provided

        if provided and missing:
            logger.warning(
                "[website-engine] SMTP is partially configured — emails will NOT be sent.\n"
                "  Provided: %s\n"
                "  Missing:  %s\n"
                "  Set all five vars (or none) to enable SMTP. "
                "See .env.example for provider-specific examples.",
                sorted(provided),
                sorted(missing),
            )
        return self

    @property
    def smtp_enabled(self) -> bool:
        """True only when all five required SMTP vars are set."""
        return all([
            self.smtp_host, self.smtp_user, self.smtp_pass,
            self.smtp_from, self.smtp_to,
        ])

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins_raw.split(",") if o.strip()]

    @property
    def is_dev(self) -> bool:
        return self.env.lower() == "dev"


settings = Settings()
