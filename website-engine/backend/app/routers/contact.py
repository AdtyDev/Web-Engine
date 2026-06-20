import time
from collections import defaultdict
from threading import Lock

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr

from app.core.settings import settings
from app.services.email_service import send_contact_email

router = APIRouter(tags=["contact"])

# ---------------------------------------------------------------------------
# Simple in-memory token-bucket rate limiter (per IP, Phase 2 implementation).
# Not suitable for multi-process deployments — swap for Redis in a later phase.
# ---------------------------------------------------------------------------
_rate_store: dict[str, list[float]] = defaultdict(list)
_rate_lock = Lock()


def _is_rate_limited(ip: str) -> bool:
    """Return True if this IP has exceeded the allowed request rate."""
    now = time.monotonic()
    window = settings.contact_rate_limit_window_seconds
    max_reqs = settings.contact_rate_limit_max

    with _rate_lock:
        timestamps = _rate_store[ip]
        # Drop timestamps outside the current window
        _rate_store[ip] = [t for t in timestamps if now - t < window]
        if len(_rate_store[ip]) >= max_reqs:
            return True
        _rate_store[ip].append(now)
        return False


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class ContactFormInput(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str
    honeypot: str = ""  # Must stay empty — bots fill it, humans don't


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/contact")
async def submit_contact(request: Request, body: ContactFormInput) -> dict:
    """
    Handle contact form submissions.

    Bot protection (§4):
      - Non-empty honeypot → silently return 200 without sending anything.
        We never tip off the bot that it was detected.

    Rate limiting (§4):
      - Simple in-memory token bucket per client IP.
      - Max 5 requests per 60 seconds by default (configurable via settings).

    Email (§4):
      - Delegated to email_service, which uses SMTP when configured
        and falls back to console logging in dev.
    """
    # 1. Honeypot check — silent drop
    if body.honeypot:
        return {"status": "ok"}

    # 2. Rate limit check
    client_ip = request.client.host if request.client else "unknown"
    if _is_rate_limited(client_ip):
        # Return 429 only for legitimate-looking traffic that's rate-limited.
        # (Bots already got a silent 200 above.)
        from fastapi import HTTPException
        raise HTTPException(status_code=429, detail="Too many requests. Please wait before trying again.")

    # 3. Send email (or log to console in dev)
    send_contact_email(
        name=body.name,
        email=str(body.email),
        phone=body.phone,
        message=body.message,
    )

    return {"status": "ok"}
