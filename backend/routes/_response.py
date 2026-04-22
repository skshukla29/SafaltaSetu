from datetime import datetime, timezone
from typing import Any

from fastapi import Request
from pydantic import BaseModel, Field


API_VERSION = "v1"


class ResponseEnvelope(BaseModel):
    version: str = Field(default=API_VERSION)
    success: bool
    data: Any
    meta: dict[str, Any]


def versioned_response(data: Any, request: Request) -> dict[str, Any]:
    return {
        "version": API_VERSION,
        "success": True,
        "data": data,
        "meta": {
            "path": request.url.path,
            "method": request.method,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }