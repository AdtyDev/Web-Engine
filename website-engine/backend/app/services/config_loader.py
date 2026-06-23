"""
Loads and validates the JSON config for the active CLIENT_ID.

Design contract (from spec §4 and §7):
  - Called at startup via the lifespan hook in main.py.
  - If the file doesn't exist or fails Pydantic validation → raise immediately with a clear message.
  - Never serve a half-broken config silently.
  - Cached after the first successful load (lru_cache maxsize=1).
    Call `get_config.cache_clear()` in tests to reset between test cases.

  - `load_config_for_client(client_id)` is the non-cached variant used by:
      * The dev-only ?client= query param override
      * Tests and CLI tooling
      * `load_config_from_file()` for an explicit path
"""
import json
from functools import lru_cache
from pathlib import Path

from pydantic import ValidationError

from app.core.settings import settings
from app.models.config_schema import ClientConfig


@lru_cache(maxsize=1)
def get_config() -> ClientConfig:
    """
    Load, parse, and validate the startup config. Raises on any error.

    Raises:
        FileNotFoundError: if the config file doesn't exist.
        ValueError: if the JSON is malformed or fails validation.
    """
    return load_config_for_client(settings.client_id)


def load_config_for_client(client_id: str) -> ClientConfig:
    """
    Load and validate the config for an arbitrary client_id.
    NOT cached — each call reads from disk.
    Used by the dev ?client= override, tests, and CLI tooling.

    Raises:
        FileNotFoundError | ValueError
    """
    config_path = _resolve_config_path(settings.config_dir, client_id)

    if not config_path.exists():
        available = list(Path(settings.config_dir).glob("*.json"))
        raise FileNotFoundError(
            f"\n\n[website-engine] Config file not found: {config_path}\n"
            f"  Set CLIENT_ID to match a file in {settings.config_dir}/\n"
            f"  Available files: {available}\n"
        )

    try:
        raw = json.loads(config_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"\n\n[website-engine] Config file is not valid JSON: {config_path}\n"
            f"  Error: {exc}\n"
        ) from exc

    try:
        return ClientConfig.model_validate(raw)
    except ValidationError as exc:
        raise ValueError(
            f"\n\n[website-engine] Config validation failed for {config_path}:\n"
            f"{exc}\n\n"
            f"  Run 'python scripts/generate_schema.py' to see the expected schema.\n"
        ) from exc


def load_config_from_file(path: Path) -> ClientConfig:
    """
    Load and validate a config from an explicit path.
    Used by tests and tooling — does NOT use the lru_cache.

    Raises: FileNotFoundError | ValueError (wraps JSONDecodeError | ValidationError)
    """
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Config file is not valid JSON: {path}\nError: {exc}") from exc

    try:
        return ClientConfig.model_validate(raw)
    except ValidationError as exc:
        raise ValueError(f"Config validation failed for {path}:\n{exc}") from exc


def _resolve_config_path(config_dir: str, client_id: str) -> Path:
    """Return the resolved Path for a given config_dir and client_id.

    Relative config_dir values are interpreted relative to the backend package
    root, not the current working directory. That makes tests and deployments
    more predictable when the backend is imported from outside its own folder.
    """
    base = Path(config_dir)
    if not base.is_absolute():
        base = Path(__file__).resolve().parents[2] / config_dir
    return base / f"{client_id}.json"
