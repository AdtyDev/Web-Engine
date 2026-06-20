import logging
import smtplib
import time
from collections import defaultdict
from threading import Lock

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, field_validator

from app.core.settings import settings
from app.services.email_service import send_contact_email

logger = logging.getLogger(__name__)

router = APIRouter(tags=["contact"])

# ---------------------------------------------------------------------------
# In-memory rate limiter — sliding window per IP.
# Swap for Redis when running multiple backend processes.
# ---------------------------------------------------------------------------
_rate_store: dict[str, list[float]] = defaultdict(list)
_rate_lock = Lock()


def _check_rate_limit(ip: str) -> float | None:
    """
    Return None if the request is allowed.
    Return the number of seconds until the window expires if rate-limited.
    """
    now = time.monotonic()
    window = settings.contact_rate_limit_window_seconds
    max_reqs = settings.contact_rate_limit_max

    with _rate_lock:
        _rate_store[ip] = [t for t in _rate_store[ip] if now - t < window]
        if len(_rate_store[ip]) >= max_reqs:
            oldest = _rate_store[ip][0]
            retry_after = window - (now - oldest)
            return max(1.0, retry_after)
        _rate_store[ip].append(now)
        return None


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

MESSAGE_MIN = 10
MESSAGE_MAX = 2000


class ContactFormInput(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str
    honeypot: str = ""  # Must stay empty — bots fill it, humans don't

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters.")
        return v

    @field_validator("message")
    @classmethod
    def message_length(cls, v: str) -> str:
        v = v.strip()
        if len(v) < MESSAGE_MIN:
            raise ValueError(f"Message must be at least {MESSAGE_MIN} characters.")
        if len(v) > MESSAGE_MAX:
            raise ValueError(f"Message must be at most {MESSAGE_MAX} characters.")
        return v


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/contact")
async def submit_contact(request: Request, body: ContactFormInput) -> dict:
    """
    Handle contact form submissions.

    Bot protection:
      - Non-empty honeypot → silent 200 (never tip off the bot).

    Rate limiting:
      - 5 req / 60 s per IP (configurable via settings).
      - Returns 429 with `Retry-After` header and structured body.

    Email:
      - Delegated to email_service.
      - SMTP failure → 503 with user-friendly error code.
      - Dev (no SMTP configured) → logs to console, still returns 200.
    """
    # 1. Honeypot — silent drop
    if body.honeypot:
        return {"status": "ok"}

    # 2. Rate limit
    client_ip = request.client.host if request.client else "unknown"
    retry_after = _check_rate_limit(client_ip)
    if retry_after is not None:
        raise HTTPException(
            status_code=429,
            detail={
                "code": "rate_limited",
                "message": "You've sent too many messages recently. Please wait a moment before trying again.",
                "retry_after_seconds": int(retry_after),
            },
            headers={"Retry-After": str(int(retry_after))},
        )

    # 3. Send email — include the business name in the subject line
    from app.services.config_loader import get_config as _get_config
    try:
        _cfg = _get_config()
        _biz = _cfg.meta.business_name
    except Exception:
        _biz = ""

    try:
        send_contact_email(
            name=body.name,
            email=str(body.email),
            phone=body.phone,
            message=body.message,
            business_name=_biz,
        )
    except smtplib.SMTPException as exc:
        logger.error("SMTP failure sending contact email from %s: %s", body.email, exc)
        raise HTTPException(
            status_code=503,
            detail={
                "code": "email_unavailable",
                "message": "Our messaging service is temporarily unavailable. Please contact us directly by phone or email.",
            },
        )
    except Exception as exc:
        # Catch-all — don't leak internal details to the client
        logger.error("Unexpected error sending contact email: %s", exc)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "internal_error",
                "message": "Something went wrong. Please try again later.",
            },
        )

    return {"status": "ok"}
