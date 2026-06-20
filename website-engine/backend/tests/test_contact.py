"""
Tests for POST /api/contact — §7 requirement:
  "write tests for /api/contact (honeypot is silently dropped, valid submission 200s)"
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID_PAYLOAD = {
    "name": "Aisha Kumar",
    "email": "aisha@example.com",
    "phone": "+91 98765 43210",
    "message": "I would like to book an appointment.",
    "honeypot": "",
}


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------

def test_valid_submission_returns_200():
    """A clean submission (empty honeypot, valid fields) must return 200."""
    resp = client.post("/api/contact", json=VALID_PAYLOAD)
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_valid_submission_without_phone():
    """Phone is optional."""
    payload = {**VALID_PAYLOAD, "phone": None}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200


def test_valid_submission_without_honeypot_key():
    """Honeypot key can be absent entirely (defaults to empty string)."""
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "honeypot"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Bot / honeypot protection
# ---------------------------------------------------------------------------

def test_honeypot_filled_returns_200_silently():
    """
    A bot submission (non-empty honeypot) must return 200 without doing anything.
    We never tip off the bot that it was detected.
    """
    payload = {**VALID_PAYLOAD, "honeypot": "I am a bot"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_honeypot_whitespace_is_caught():
    """Whitespace-only honeypot is also a bot signal."""
    payload = {**VALID_PAYLOAD, "honeypot": "   "}
    resp = client.post("/api/contact", json=payload)
    # Whitespace is truthy in Python, so this is caught
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

def test_invalid_email_returns_422():
    """An invalid email address must be rejected with a validation error."""
    payload = {**VALID_PAYLOAD, "email": "not-an-email"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 422


def test_missing_name_returns_422():
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "name"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 422


def test_missing_message_returns_422():
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "message"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 422


def test_empty_body_returns_422():
    resp = client.post("/api/contact", json={})
    assert resp.status_code == 422
