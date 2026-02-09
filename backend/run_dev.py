#!/usr/bin/env python3
"""
Development server runner for Comes backend
"""

import os
import sys

# Set default environment variables for development
os.environ.setdefault('FLASK_ENV', 'development')
os.environ.setdefault('FLASK_APP', 'app.py')
os.environ.setdefault('PORT', '5000')

# Mock API key for development (users should set their own in .env)
if 'GOOGLE_GENAI_API_KEY' not in os.environ:
    print("Warning: GOOGLE_GENAI_API_KEY not set. AI analysis will not work.")
    print("Set it in .env file or environment variable for full functionality.")
    os.environ['GOOGLE_GENAI_API_KEY'] = 'mock-key-for-development'

# Import and run the app
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'

    print(f"Starting Comes Backend on http://localhost:{port}")
    print(f"Debug mode: {debug}")
    print("\nAvailable endpoints:")
    print("  GET  /api/health                    - Health check")
    print("  GET  /                              - API documentation")
    print("  GET  /api/student-applications/     - List applications")
    print("  POST /api/student-applications/upload - Upload files")
    print("  POST /api/student-applications/analyze/<id> - Analyze documents")
    print("  GET  /api/student-applications/<id> - Get application details")
    print("  GET  /api/student-applications/template - Get template")

    app.run(host='0.0.0.0', port=port, debug=debug)