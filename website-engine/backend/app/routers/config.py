from fastapi import APIRouter
from app.models.config_schema import ClientConfig
from app.services.config_loader import get_config

router = APIRouter(tags=["config"])


@router.get("/config", response_model=ClientConfig)
async def get_site_config() -> ClientConfig:
    """Return the validated site config for the active CLIENT_ID."""
    return get_config()
