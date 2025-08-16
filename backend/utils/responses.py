"""
Response wrapper utilities for consistent API responses
"""

from typing import Any, Optional, Dict
from datetime import datetime


def success_response(data: Any, meta: Optional[Dict] = None):
    """Wrap successful responses consistently for TanStack Query compatibility"""
    return {
        "success": True,
        "data": data,
        "meta": meta or {},
        "timestamp": datetime.utcnow().isoformat()
    }


def error_response(message: str, code: str = "ERROR", details: Optional[Dict] = None):
    """Wrap error responses consistently for TanStack Query compatibility"""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {}
        },
        "timestamp": datetime.utcnow().isoformat()
    }


def paginated_response(data: Any, page: int, limit: int, total: int, meta: Optional[Dict] = None):
    """Wrap paginated responses with consistent pagination metadata"""
    has_more = (page * limit) < total
    
    pagination_meta = {
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": has_more
    }
    
    combined_meta = {**pagination_meta, **(meta or {})}
    
    return success_response(data, combined_meta)