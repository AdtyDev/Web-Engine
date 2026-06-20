from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr

router = APIRouter(tags=["contact"])


class ContactFormInput(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str
    honeypot: str = ""  # must stay empty — bots fill it, humans don't


@router.post("/contact")
async def submit_contact(request: Request, body: ContactFormInput) -> dict:
    """
    Handle contact form submissions.
    - Silently drop bot submissions (non-empty honeypot).
    - Rate-limit by IP (placeholder — implemented in Phase 6).
    - Send email or log to console (implemented in Phase 6).
    """
    # Placeholder — logic added in Phase 6
    return {"status": "ok"}
