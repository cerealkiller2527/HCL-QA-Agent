"""
Input validation utilities for the backend
"""

import re
from typing import Optional
from fastapi import HTTPException

class Validators:
    """Input validation utilities"""
    
    # Regex patterns for validation
    REPO_OWNER_PATTERN = re.compile(r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$')
    DATASET_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9_\-\.]+$')
    SAFE_PATH_PATTERN = re.compile(r'^[a-zA-Z0-9_\-\.\/]+$')
    
    @classmethod
    def validate_repo_owner(cls, owner: str) -> str:
        """
        Validate repository owner (username or organization)
        HuggingFace usernames follow GitHub-like rules
        """
        if not owner:
            raise HTTPException(status_code=400, detail="Owner cannot be empty")
        
        if len(owner) > 39:
            raise HTTPException(status_code=400, detail="Owner name too long (max 39 characters)")
        
        if not cls.REPO_OWNER_PATTERN.match(owner):
            raise HTTPException(
                status_code=400, 
                detail="Invalid owner format. Must start/end with alphanumeric, can contain hyphens"
            )
        
        return owner
    
    @classmethod
    def validate_dataset_name(cls, name: str) -> str:
        """
        Validate dataset name
        Dataset names can contain letters, numbers, underscores, hyphens, and dots
        """
        if not name:
            raise HTTPException(status_code=400, detail="Dataset name cannot be empty")
        
        if len(name) > 100:
            raise HTTPException(status_code=400, detail="Dataset name too long (max 100 characters)")
        
        if not cls.DATASET_NAME_PATTERN.match(name):
            raise HTTPException(
                status_code=400,
                detail="Invalid dataset name format. Can only contain letters, numbers, _, -, and ."
            )
        
        return name
    
    @classmethod
    def validate_episode_id(cls, episode_id: int) -> int:
        """
        Validate episode ID
        """
        if episode_id < 0:
            raise HTTPException(status_code=400, detail="Episode ID must be non-negative")
        
        if episode_id > 999999:
            raise HTTPException(status_code=400, detail="Episode ID too large")
        
        return episode_id
    
    @classmethod
    def validate_repo_id(cls, repo_id: str) -> str:
        """
        Validate full repository ID (owner/dataset_name format)
        """
        if not repo_id or '/' not in repo_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid repository ID format. Expected: owner/dataset_name"
            )
        
        parts = repo_id.split('/', 1)
        if len(parts) != 2:
            raise HTTPException(
                status_code=400,
                detail="Invalid repository ID format. Expected: owner/dataset_name"
            )
        
        owner, dataset_name = parts
        cls.validate_repo_owner(owner)
        cls.validate_dataset_name(dataset_name)
        
        return repo_id
    
    @classmethod
    def sanitize_search_query(cls, query: Optional[str]) -> Optional[str]:
        """
        Sanitize search query to prevent injection
        """
        if not query:
            return None
        
        # Remove any potentially dangerous characters
        # Allow alphanumeric, spaces, and common punctuation
        sanitized = re.sub(r'[^\w\s\-\.\,\!\?]', '', query)
        
        # Limit length
        if len(sanitized) > 200:
            sanitized = sanitized[:200]
        
        return sanitized.strip() if sanitized else None

# Create singleton instance
validators = Validators()