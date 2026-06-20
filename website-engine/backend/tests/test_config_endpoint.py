"""Tests for GET /api/config."""
from fastapi.testclient import TestClient
from app.main import app
from app.models.config_schema import ClientConfig

client = TestClient(app)


def test_config_returns_200():
    resp = client.get("/api/config")
    assert resp.status_code == 200


def test_config_response_is_valid_schema():
    """The API response must be parseable as ClientConfig."""
    resp = client.get("/api/config")
    assert resp.status_code == 200
    cfg = ClientConfig.model_validate(resp.json())
    assert cfg.client_id == "clinic"


def test_config_has_required_fields():
    resp = client.get("/api/config")
    data = resp.json()
    assert "client_id" in data
    assert "meta" in data
    assert "theme" in data
    assert "sections" in data
    assert "contact" in data


def test_config_theme_has_colors():
    resp = client.get("/api/config")
    theme = resp.json()["theme"]
    assert theme["primary_color"].startswith("#")
    assert theme["secondary_color"].startswith("#")
    assert theme["accent_color"].startswith("#")
