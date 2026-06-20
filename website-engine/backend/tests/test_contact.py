"""
Tests for POST /api/contact — Phase 5 E2E.

Covers:
  - Valid submissions (200)
  - Honeypot (silent 200)
  - Input validation (422)
  - Rate limiting (429 with structured body + Retry-After header)
  - SMTP failure (503 with structured body)
  - Field validators (name min length, message min/max)
"""
import importlib
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import smtplib

from app.main import app

client = TestClient(app)

VALID_PAYLOAD = {
    "name": "Aisha Kumar",
    "email": "aisha@example.com",
    "phone": "+91 98765 43210",
    "message": "I would like to book an appointment for a general checkup.",
    "honeypot": "",
}


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------

def test_valid_submission_returns_200():
    resp = client.post("/api/contact", json=VALID_PAYLOAD)
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_valid_submission_without_phone():
    payload = {**VALID_PAYLOAD, "phone": None}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200


def test_valid_submission_without_honeypot_key():
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "honeypot"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Bot / honeypot protection
# ---------------------------------------------------------------------------

def test_honeypot_filled_returns_200_silently():
    payload = {**VALID_PAYLOAD, "honeypot": "I am a bot"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_honeypot_whitespace_is_truthy_and_caught():
    payload = {**VALID_PAYLOAD, "honeypot": "   "}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Input validation — 422
# ---------------------------------------------------------------------------

def test_invalid_email_returns_422():
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


def test_name_too_short_returns_422():
    payload = {**VALID_PAYLOAD, "name": "A"}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 422


def test_message_too_short_returns_422():
    payload = {**VALID_PAYLOAD, "message": "Hi"}  # < 10 chars
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 422


def test_message_too_long_returns_422():
    payload = {**VALID_PAYLOAD, "message": "x" * 2001}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 422


def test_message_at_max_length_is_valid():
    payload = {**VALID_PAYLOAD, "message": "x" * 2000}
    resp = client.post("/api/contact", json=payload)
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Rate limiting — 429
# ---------------------------------------------------------------------------

def test_rate_limit_returns_429_with_structured_body():
    """Exceed the default 5-per-60s limit and confirm structured 429 response."""
    import app.routers.contact as contact_module

    # Reset rate store before test
    contact_module._rate_store.clear()

    # Patch settings to allow only 2 requests per window
    with patch.object(contact_module.settings, "contact_rate_limit_max", 2):
        client.post("/api/contact", json=VALID_PAYLOAD)
        client.post("/api/contact", json=VALID_PAYLOAD)
        resp = client.post("/api/contact", json=VALID_PAYLOAD)

    assert resp.status_code == 429
    body = resp.json()
    assert body["detail"]["code"] == "rate_limited"
    assert "retry_after_seconds" in body["detail"]
    assert "Retry-After" in resp.headers

    # Cleanup
    contact_module._rate_store.clear()


def test_rate_limit_detail_has_user_friendly_message():
    import app.routers.contact as contact_module
    contact_module._rate_store.clear()

    with patch.object(contact_module.settings, "contact_rate_limit_max", 1):
        client.post("/api/contact", json=VALID_PAYLOAD)
        resp = client.post("/api/contact", json=VALID_PAYLOAD)

    assert resp.status_code == 429
    msg = resp.json()["detail"]["message"]
    assert len(msg) > 10  # non-empty user-facing message

    contact_module._rate_store.clear()


# ---------------------------------------------------------------------------
# SMTP failure — 503
# ---------------------------------------------------------------------------

def test_smtp_failure_returns_503():
    """When SMTP raises, the endpoint returns 503 with structured error body."""
    with patch("app.routers.contact.send_contact_email", side_effect=smtplib.SMTPException("Connection refused")):
        resp = client.post("/api/contact", json=VALID_PAYLOAD)

    assert resp.status_code == 503
    body = resp.json()
    assert body["detail"]["code"] == "email_unavailable"
    assert "message" in body["detail"]


def test_smtp_failure_message_is_user_friendly():
    with patch("app.routers.contact.send_contact_email", side_effect=smtplib.SMTPException("Auth failed")):
        resp = client.post("/api/contact", json=VALID_PAYLOAD)

    assert resp.status_code == 503
    msg = resp.json()["detail"]["message"]
    # Should not leak "Auth failed" or any internal detail
    assert "Auth" not in msg
    assert "SMTP" not in msg
    assert len(msg) > 20


def test_unexpected_exception_returns_500():
    """Non-SMTP exceptions also get caught and return 500."""
    with patch("app.routers.contact.send_contact_email", side_effect=RuntimeError("DB down")):
        resp = client.post("/api/contact", json=VALID_PAYLOAD)

    assert resp.status_code == 500
    body = resp.json()
    assert body["detail"]["code"] == "internal_error"
    # Must not leak "DB down"
    assert "DB" not in body["detail"]["message"]
