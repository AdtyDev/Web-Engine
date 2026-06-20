from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    client_id: str = "clinic"
    config_dir: str = "./configs"
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    env: str = "dev"

    # SMTP — all optional; falls back to console logging in dev
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    smtp_from: str = ""
    smtp_to: str = ""


settings = Settings()
