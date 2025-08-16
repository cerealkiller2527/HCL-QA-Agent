"""
Common Pydantic models used across the API
"""

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response"""

    status: str
    timestamp: datetime


class ErrorResponse(BaseModel):
    """Standard error response"""

    detail: str
    status_code: Optional[int] = None


class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints"""

    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Items per page")
    total: Optional[int] = Field(None, description="Total items available")


class MetadataResponse(BaseModel):
    """Generic metadata response"""

    key: str
    value: Any


class ApiInfo(BaseModel):
    """API information response"""

    message: str
    version: str
    status: str
