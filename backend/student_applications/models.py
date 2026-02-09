"""
Data models for student applications
"""

import uuid
import json
from datetime import datetime
from typing import Dict, Any, Optional

class StudentApplication:
    """Represents a student application with uploaded files and analysis results"""

    # In-memory storage for demo (would be replaced with database in production)
    _applications = {}

    def __init__(self, files: Dict[str, Any], status: str = 'pending'):
        self.id = str(uuid.uuid4())
        self.files = files  # Dict with file_key: {filename, filepath, content_type}
        self.status = status  # 'pending', 'uploaded', 'analyzing', 'analyzed', 'completed', 'failed'
        self.analysis_result = None
        self.structured_summary = None
        self.error_message = None
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

    def save(self):
        """Save the application to in-memory storage"""
        self.updated_at = datetime.now()
        self.__class__._applications[self.id] = self
        return self

    def to_dict(self) -> Dict[str, Any]:
        """Convert application to dictionary for JSON response"""
        return {
            'id': self.id,
            'files': self.files,
            'status': self.status,
            'analysis_result': self.analysis_result,
            'structured_summary': self.structured_summary,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @classmethod
    def get_by_id(cls, application_id: str) -> Optional['StudentApplication']:
        """Get application by ID"""
        return cls._applications.get(application_id)

    @classmethod
    def get_all(cls):
        """Get all applications"""
        return list(cls._applications.values())

    @classmethod
    def delete_all(cls):
        """Clear all applications (for testing)"""
        cls._applications = {}