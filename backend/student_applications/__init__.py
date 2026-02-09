"""
Student Application Information Module
Handles processing of student applications including document upload,
information extraction using Google GenAI, and structured output generation.
"""

from .routes import student_bp
from .services import StudentApplicationService

__all__ = ['student_bp', 'StudentApplicationService']