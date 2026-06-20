"""
Loads and validates the JSON config for the active CLIENT_ID.
Called once at startup; crashes loudly if the config is invalid.
"""
import json
from pathlib import Path
from functools import lru_cache

from app.core.settings import settings
from app.models.config_schema import ClientConfig


@lru_cache(maxsize=1)
def get_config() -> ClientConfig:
    """Load, parse, and validate the config. Raise on any error."""
    config_path = Path(settings.config_dir) / f"{settings.client_id}.json"

    if not config_path.exists():
        raise FileNotFoundError(
            f"Config file not found: {config_path}. "
            f"Set CLIENT_ID to match a file in {settings.config_dir}/"
        )

    raw = json.loads(config_path.read_text(encoding="utf-8"))
    # Pydantic v2 — validation errors raise ValidationError with a clear message
    return ClientConfig.model_validate(raw)
