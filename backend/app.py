#!/usr/bin/env python3
"""
Comes Backend - Student Application Information Module
Main Flask application for processing student applications
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)

    # Configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-secret-key'),
        UPLOAD_FOLDER=os.path.join(os.path.dirname(__file__), 'uploads'),
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max file size
        ALLOWED_EXTENSIONS={'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'txt'},
    )

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from student_applications.routes import student_bp
    app.register_blueprint(student_bp, url_prefix='/api/student-applications')

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Comes Student Application API',
            'version': '1.0.0'
        })

    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Comes Student Application Information API',
            'endpoints': {
                'health': '/api/health',
                'student_applications': '/api/student-applications/',
                'upload': '/api/student-applications/upload',
                'analyze': '/api/student-applications/analyze'
            }
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({'error': 'File size exceeds the 16MB limit'}), 413

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)