"""
Tests for config_loader — §7 requirement:
  "write a handful of tests for config_loader (valid config loads, invalid config raises)"
"""
import json
import pytest
from pathlib import Path
from pydantic import ValidationError

from app.services.config_loader import load_config_from_file, get_config
from app.models.config_schema import ClientConfig


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _write_temp_config(tmp_path: Path, data: dict, filename: str = "test-client.json") -> Path:
    p = tmp_path / filename
    p.write_text(json.dumps(data), encoding="utf-8")
    return p


MINIMAL_VALID = {
    "client_id": "test-client",
}

FULL_VALID = {
    "client_id": "test-clinic",
    "meta": {
        "business_name": "Test Clinic",
        "business_type": "clinic",
        "tagline": "Testing",
        "logo_url": "/assets/test/logo.png",
        "favicon_url": "/assets/test/favicon.ico",
    },
    "theme": {
        "primary_color": "#2563eb",
        "secondary_color": "#64748b",
        "accent_color": "#f59e0b",
        "font_heading": "Inter",
        "font_body": "Inter",
        "border_radius": "md",
    },
    "sections": {
        "hero": {
            "enabled": True,
            "headline": "Test Headline",
            "subheadline": "Sub",
            "cta_text": "Book",
            "cta_link": "#contact",
            "background_image": "",
        },
        "offerings": {
            "enabled": True,
            "title": "Services",
            "type": "services",
            "items": [
                {
                    "id": "s1",
                    "name": "General Check-up",
                    "description": "Annual health check",
                    "price": 500.0,
                    "currency": "INR",
                }
            ],
        },
    },
}


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------

def test_load_minimal_valid_config(tmp_path):
    """A config with only client_id is valid — all other fields have defaults."""
    path = _write_temp_config(tmp_path, MINIMAL_VALID)
    cfg = load_config_from_file(path)
    assert isinstance(cfg, ClientConfig)
    assert cfg.client_id == "test-client"
    assert cfg.meta.business_name == ""  # default
    assert cfg.sections.hero is None  # default


def test_load_full_valid_config(tmp_path):
    """A fully populated config parses correctly."""
    path = _write_temp_config(tmp_path, FULL_VALID)
    cfg = load_config_from_file(path)
    assert cfg.client_id == "test-clinic"
    assert cfg.meta.business_name == "Test Clinic"
    assert cfg.theme.primary_color == "#2563eb"
    assert cfg.sections.hero is not None
    assert cfg.sections.hero.enabled is True
    assert cfg.sections.hero.headline == "Test Headline"


def test_load_offerings_defaults(tmp_path):
    """OfferingItem defaults (currency INR, featured False) apply correctly."""
    data = {
        "client_id": "test",
        "sections": {
            "offerings": {
                "enabled": True,
                "title": "Menu",
                "type": "menu",
                "items": [{"id": "d1", "name": "Dal Makhani"}],
            }
        },
    }
    path = _write_temp_config(tmp_path, data)
    cfg = load_config_from_file(path)
    item = cfg.sections.offerings.items[0]
    assert item.currency == "INR"
    assert item.featured is False
    assert item.price is None


def test_clinic_json_is_valid():
    """The canonical clinic.json reference config must always pass validation."""
    clinic_path = Path(__file__).parent.parent / "configs" / "clinic.json"
    cfg = load_config_from_file(clinic_path)
    assert cfg.client_id == "clinic"
    assert cfg.meta.business_type == "clinic"
    # Hero must be enabled on the canonical config
    assert cfg.sections.hero is not None
    assert cfg.sections.hero.enabled is True


def test_restaurant_json_is_valid():
    restaurant_path = Path(__file__).parent.parent / "configs" / "restaurant.json"
    cfg = load_config_from_file(restaurant_path)
    assert cfg.client_id == "restaurant"
    assert cfg.sections.offerings.type == "menu"


def test_gym_json_is_valid():
    gym_path = Path(__file__).parent.parent / "configs" / "gym.json"
    cfg = load_config_from_file(gym_path)
    assert cfg.client_id == "gym"
    assert cfg.sections.pricing is not None
    assert cfg.sections.pricing.enabled is True


def test_template_json_is_valid():
    """The blank template must also pass validation."""
    template_path = Path(__file__).parent.parent / "configs" / "template.json"
    cfg = load_config_from_file(template_path)
    assert cfg.client_id == ""


# ---------------------------------------------------------------------------
# Failure path
# ---------------------------------------------------------------------------

def test_missing_file_raises_file_not_found(tmp_path):
    missing = tmp_path / "nonexistent.json"
    with pytest.raises(FileNotFoundError, match="not found"):
        load_config_from_file(missing)


def test_invalid_json_raises_value_error(tmp_path):
    p = tmp_path / "bad.json"
    p.write_text("{this is not json}", encoding="utf-8")
    with pytest.raises(ValueError, match="not valid JSON"):
        load_config_from_file(p)


def test_invalid_business_type_raises(tmp_path):
    """business_type must be one of the allowed literals."""
    data = {"client_id": "bad", "meta": {"business_type": "hospital"}}
    path = _write_temp_config(tmp_path, data)
    with pytest.raises(ValueError):
        load_config_from_file(path)


def test_invalid_border_radius_raises(tmp_path):
    data = {"client_id": "bad", "theme": {"border_radius": "xxl"}}
    path = _write_temp_config(tmp_path, data)
    with pytest.raises(ValueError):
        load_config_from_file(path)


def test_invalid_offerings_type_raises(tmp_path):
    data = {
        "client_id": "bad",
        "sections": {
            "offerings": {"enabled": True, "title": "X", "type": "yoga"}
        },
    }
    path = _write_temp_config(tmp_path, data)
    with pytest.raises(ValueError):
        load_config_from_file(path)


def test_get_config_cache_cleared_between_calls(tmp_path, monkeypatch):
    """get_config() caches results; cache_clear() resets it."""
    # Point settings at a temp config
    import app.core.settings as settings_module
    import app.services.config_loader as loader_module

    original = settings_module.settings.client_id

    path = _write_temp_config(tmp_path, MINIMAL_VALID)
    monkeypatch.setattr(settings_module.settings, "client_id", "test-client")
    monkeypatch.setattr(settings_module.settings, "config_dir", str(tmp_path))
    loader_module.get_config.cache_clear()

    cfg = loader_module.get_config()
    assert cfg.client_id == "test-client"

    # Cleanup
    loader_module.get_config.cache_clear()
    monkeypatch.setattr(settings_module.settings, "client_id", original)
