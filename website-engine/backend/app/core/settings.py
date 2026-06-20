from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    # In prod (VPS/same-origin): can stay empty — CORS isn't needed when frontend+backend share a domain.
    allowed_origins_raw: str = "http://localhost:5173,http://localhost:3000"

    env: str = "dev"

    # SMTP — all optional; falls back to console logging in dev
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from: str = ""
    smtp_to: str = ""

    # In-memory rate limit: max requests per window per IP (Phase 6)
    contact_rate_limit_max: int = 5
    contact_rate_limit_window_seconds: int = 60

    @property
    def allowed_origins(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS_RAW into a list."""
        return [o.strip() for o in self.allowed_origins_raw.split(",") if o.strip()]

    @property
    def is_dev(self) -> bool:
        return self.env.lower() == "dev"


settings = Settings()
