from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.routers import health, config, contact
from app.services.config_loader import get_config


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: validate the config immediately.
    If the config is missing or invalid, this raises before the server accepts any traffic.
    That is intentional — a bad config must never silently serve a broken site.
    """
    cfg = get_config()  # raises FileNotFoundError or ValidationError on bad config
    print(
        f"[website-engine] Loaded config: client_id={cfg.client_id!r} "
        f"business_name={cfg.meta.business_name!r}"
    )
    yield
    # (shutdown logic goes here if needed in future phases)


app = FastAPI(title="Website Engine API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(health.router, prefix="/api")
app.include_router(config.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
