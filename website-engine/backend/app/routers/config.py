from fastapi import APIRouter, HTTPException, Query, Response

from app.core.settings import settings
from app.models.config_schema import ClientConfig
from app.services.config_loader import get_config, load_config_for_client

router = APIRouter(tags=["config"])


@router.get("/config", response_model=ClientConfig)
async def get_site_config(
    client: str | None = Query(
        default=None,
        description="Dev-only: override CLIENT_ID for this request. Forbidden in production.",
    ),
) -> Response:
    """
    Return the validated site config.

    In dev (`ENV=dev`), an optional `?client=restaurant` query param loads
    a different config on the fly without restarting the server.
    This is forbidden in production — it would let anyone read arbitrary configs.
    """
    if client and client != settings.client_id:
        if not settings.is_dev:
            raise HTTPException(
                status_code=403,
                detail="Client override is only allowed in dev mode.",
            )
        cfg = load_config_for_client(client)
    else:
        cfg = get_config()

    # Prevent browser caching so config changes reflect immediately
    return Response(
        content=cfg.model_dump_json(),
        media_type="application/json",
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
    )