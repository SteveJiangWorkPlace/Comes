"""
Tests for student application API routes
"""
import os
import json
import pytest
from unittest.mock import Mock, patch, MagicMock
from io import BytesIO

from student_applications.routes import student_bp, api_response, api_error


class TestAPIResponseHelpers:
    """Tests for API response helper functions"""

    @pytest.fixture
    def app(self):
        """Create Flask app for testing"""
        from app import create_app
        app = create_app()
        app.config['TESTING'] = True
        with app.app_context():
            yield app

    def test_api_response_success(self, app):
        """Test successful API response"""
        with app.app_context():
            response, status_code = api_response(
                success=True,
                data={'test': 'data'},
                message='Success',
                extra='value'
            )

            response_data = json.loads(response.get_data(as_text=True))

            assert status_code == 200
            assert response_data['success'] is True
            assert response_data['data'] == {'test': 'data'}
            assert response_data['message'] == 'Success'
            assert response_data['extra'] == 'value'
            assert 'error' not in response_data

    def test_api_response_error(self, app):
        """Test error API response"""
        with app.app_context():
            response, status_code = api_response(
                success=False,
                data=None,
                error={'message': 'Error occurred'},
                status_code=400
            )

            response_data = json.loads(response.get_data(as_text=True))

            assert status_code == 400
            assert response_data['success'] is False
            assert response_data['error'] == {'message': 'Error occurred'}
            assert 'data' not in response_data

    def test_api_response_remove_none_values(self, app):
        """Test that None values are removed from response"""
        with app.app_context():
            response, _ = api_response(
                success=True,
                data=None,
                message=None,
                error=None
            )

            response_data = json.loads(response.get_data(as_text=True))

            assert 'data' not in response_data
            assert 'message' not in response_data
            assert 'error' not in response_data
            assert response_data['success'] is True

    def test_api_error_function(self, app):
        """Test api_error helper function"""
        with app.app_context():
            response, status_code = api_error(
                message='Validation failed',
                status=422,
                code='VALIDATION_ERROR',
                details={'field': 'email'},
                validation_errors=['Email is required']
            )

            response_data = json.loads(response.get_data(as_text=True))

            assert status_code == 422
            assert response_data['success'] is False
            assert response_data['error']['message'] == 'Validation failed'
            assert response_data['error']['status'] == 422
            assert response_data['error']['code'] == 'VALIDATION_ERROR'
            assert response_data['error']['details'] == {'field': 'email'}
            assert response_data['error']['validationErrors'] == ['Email is required']


class TestStudentApplicationRoutes:
    """Tests for student application routes"""

    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    @pytest.fixture
    def mock_files(self):
        """Create mock file upload data"""
        return {
            'transcript': (BytesIO(b'transcript content'), 'transcript.pdf'),
            'degree_certificate': (BytesIO(b'degree content'), 'degree.pdf'),
            'resume': (BytesIO(b'resume content'), 'resume.docx'),
            'ielts_score': (BytesIO(b'ielts content'), 'ielts.pdf')
        }

    @pytest.fixture
    def mock_transcript_files(self):
        """Create mock transcript file upload data"""
        return {
            'transcript': (BytesIO(b'transcript content'), 'transcript.pdf')
        }

    @pytest.fixture
    def mock_separate_transcript_files(self):
        """Create mock separate transcript files"""
        return {
            'transcript_zh': (BytesIO(b'Chinese transcript content'), 'transcript_zh.pdf'),
            'transcript_en': (BytesIO(b'English transcript content'), 'transcript_en.pdf')
        }

    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['status'] == 'healthy'
        assert data['service'] == 'Comes Student Application API'

    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get('/')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['message'] == 'Comes Student Application Information API'
        assert 'endpoints' in data

    @patch('student_applications.routes.StudentApplication')
    def test_list_applications(self, mock_student_app, client):
        """Test listing all applications"""
        # Mock application data
        mock_app = Mock()
        mock_app.to_dict.return_value = {'id': 'app-123', 'status': 'completed'}
        mock_student_app.get_all.return_value = [mock_app]

        response = client.get('/api/student-applications/')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert 'applications' in data['data']
        assert len(data['data']['applications']) == 1
        assert data['data']['count'] == 1

    @patch('student_applications.routes.StudentApplication')
    def test_upload_files_success(self, mock_student_app, client, mock_files):
        """Test successful file upload"""
        # Mock application save
        mock_app = Mock()
        mock_app.id = 'app-123'
        mock_app.save = Mock()
        mock_student_app.return_value = mock_app

        response = client.post('/api/student-applications/upload', data=mock_files)
        data = json.loads(response.data)

        assert response.status_code == 201
        assert data['success'] is True
        assert data['data']['application_id'] == 'app-123'
        assert 'uploaded_files' in data['data']
        assert 'next_step' in data['data']
        assert data['message'] == 'Files uploaded successfully'

    def test_upload_files_missing_files(self, client):
        """Test file upload with missing required files"""
        # Send only some files
        files = {
            'transcript': (BytesIO(b'content'), 'transcript.pdf'),
            'degree_certificate': (BytesIO(b'content'), 'degree.pdf')
            # Missing resume and ielts_score
        }

        response = client.post('/api/student-applications/upload', data=files)
        data = json.loads(response.data)

        assert response.status_code == 400
        assert data['success'] is False
        assert data['error']['code'] == 'MISSING_FILES'
        assert 'missing_files' in data['error']['details']
        assert 'resume' in data['error']['details']['missing_files']
        assert 'ielts_score' in data['error']['details']['missing_files']

    def test_upload_files_invalid_file_type(self, client):
        """Test file upload with invalid file type"""
        files = {
            'transcript': (BytesIO(b'content'), 'transcript.exe'),  # .exe not allowed
            'degree_certificate': (BytesIO(b'content'), 'degree.pdf'),
            'resume': (BytesIO(b'content'), 'resume.docx'),
            'ielts_score': (BytesIO(b'content'), 'ielts.pdf')
        }

        response = client.post('/api/student-applications/upload', data=files)
        data = json.loads(response.data)

        assert response.status_code == 400
        assert data['success'] is False
        assert data['error']['code'] == 'INVALID_FILE_TYPE'

    @patch('student_applications.routes.StudentApplication')
    @patch('student_applications.routes.get_service')
    def test_analyze_application_success(self, mock_get_service, mock_student_app, client):
        """Test successful application analysis"""
        # Mock application
        mock_app = Mock()
        mock_app.id = 'app-123'
        mock_app.files = {'test': 'files'}
        mock_app.save = Mock()
        mock_student_app.get_by_id.return_value = mock_app

        # Mock service
        mock_service = Mock()
        mock_service.analyze_documents.return_value = {'applicant_info': {'name': '张三'}}
        mock_service.generate_structured_summary.return_value = 'Structured summary'
        mock_get_service.return_value = mock_service

        response = client.post('/api/student-applications/analyze/app-123')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['application_id'] == 'app-123'
        assert data['data']['status'] == 'completed'
        assert 'analysis_summary' in data['data']
        assert data['message'] == 'Analysis completed successfully'

        # Check that application was updated
        assert mock_app.analysis_result == {'applicant_info': {'name': '张三'}}
        assert mock_app.structured_summary == 'Structured summary'
        assert mock_app.status == 'completed'
        assert mock_app.save.call_count == 2  # Once for analyzed, once for completed

    @patch('student_applications.routes.StudentApplication')
    def test_analyze_application_not_found(self, mock_student_app, client):
        """Test analysis for non-existent application"""
        mock_student_app.get_by_id.return_value = None

        response = client.post('/api/student-applications/analyze/nonexistent')
        data = json.loads(response.data)

        assert response.status_code == 404
        assert data['success'] is False
        assert data['error']['code'] == 'NOT_FOUND'
        assert data['error']['message'] == 'Application not found'

    @patch('student_applications.routes.StudentApplication')
    @patch('student_applications.routes.get_service')
    def test_analyze_application_service_error(self, mock_get_service, mock_student_app, client):
        """Test analysis when service throws error"""
        mock_app = Mock()
        mock_app.id = 'app-123'
        mock_app.files = {}
        mock_app.save = Mock()
        mock_student_app.get_by_id.return_value = mock_app

        mock_service = Mock()
        mock_service.analyze_documents.side_effect = Exception('Analysis failed')
        mock_get_service.return_value = mock_service

        response = client.post('/api/student-applications/analyze/app-123')
        data = json.loads(response.data)

        assert response.status_code == 500
        assert 'error' in data
        assert data['error'] == 'Analysis failed'

        # Check that application status was updated to failed
        assert mock_app.status == 'failed'
        assert mock_app.error_message == 'Analysis failed'
        mock_app.save.assert_called()

    @patch('student_applications.routes.StudentApplication')
    def test_get_application_success(self, mock_student_app, client):
        """Test getting application details"""
        mock_app = Mock()
        mock_app.to_dict.return_value = {'id': 'app-123', 'status': 'completed'}
        mock_student_app.get_by_id.return_value = mock_app

        response = client.get('/api/student-applications/app-123')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['id'] == 'app-123'
        assert data['data']['status'] == 'completed'

    @patch('student_applications.routes.StudentApplication')
    def test_get_application_not_found(self, mock_student_app, client):
        """Test getting non-existent application"""
        mock_student_app.get_by_id.return_value = None

        response = client.get('/api/student-applications/nonexistent')
        data = json.loads(response.data)

        assert response.status_code == 404
        assert data['success'] is False
        assert data['error']['code'] == 'NOT_FOUND'

    def test_get_template(self, client):
        """Test getting application template"""
        response = client.get('/api/student-applications/template')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert 'template' in data['data']
        assert '# 申请信息梳理模板' in data['data']['template']

    @patch('student_applications.routes.TranscriptVerification')
    def test_upload_transcript_success(self, mock_transcript_verification, client, mock_transcript_files):
        """Test successful transcript upload (single file)"""
        mock_verification = Mock()
        mock_verification.id = 'verify-123'
        mock_verification.save = Mock()
        mock_transcript_verification.return_value = mock_verification

        data = {'upload_type': 'single'}
        data.update(mock_transcript_files)

        response = client.post('/api/student-applications/transcript/upload', data=data)
        response_data = json.loads(response.data)

        assert response.status_code == 201
        assert response_data['success'] is True
        assert response_data['data']['verification_id'] == 'verify-123'
        assert response_data['data']['upload_type'] == 'single'
        assert 'uploaded_files' in response_data['data']
        assert 'next_step' in response_data['data']
        assert response_data['message'] == 'Transcript files uploaded successfully'

    @patch('student_applications.routes.TranscriptVerification')
    def test_upload_transcript_separate_success(self, mock_transcript_verification, client, mock_separate_transcript_files):
        """Test successful separate transcript upload"""
        mock_verification = Mock()
        mock_verification.id = 'verify-123'
        mock_verification.save = Mock()
        mock_transcript_verification.return_value = mock_verification

        data = {'upload_type': 'separate'}
        data.update(mock_separate_transcript_files)

        response = client.post('/api/student-applications/transcript/upload', data=data)
        response_data = json.loads(response.data)

        assert response.status_code == 201
        assert response_data['success'] is True
        assert response_data['data']['upload_type'] == 'separate'
        assert 'transcript_zh.pdf' in response_data['data']['uploaded_files'].values()
        assert 'transcript_en.pdf' in response_data['data']['uploaded_files'].values()

    def test_upload_transcript_invalid_type(self, client):
        """Test transcript upload with invalid upload type"""
        data = {'upload_type': 'invalid'}

        response = client.post('/api/student-applications/transcript/upload', data=data)
        data = json.loads(response.data)

        assert response.status_code == 400
        assert data['success'] is False
        assert data['error']['code'] == 'INVALID_UPLOAD_TYPE'

    def test_upload_transcript_missing_files(self, client):
        """Test transcript upload with missing files"""
        data = {'upload_type': 'separate'}
        # Missing transcript_zh and transcript_en

        response = client.post('/api/student-applications/transcript/upload', data=data)
        data = json.loads(response.data)

        assert response.status_code == 400
        assert data['success'] is False
        assert data['error']['code'] == 'MISSING_FILES'

    @patch('student_applications.routes.TranscriptVerification')
    @patch('student_applications.routes.get_transcript_service')
    def test_verify_transcript_success(self, mock_get_service, mock_transcript_verification, client):
        """Test successful transcript verification"""
        # Mock verification
        mock_verification = Mock()
        mock_verification.id = 'verify-123'
        mock_verification.files = {'test': 'files'}
        mock_verification.upload_type = 'single'
        mock_verification.save = Mock()
        mock_transcript_verification.get_by_id.return_value = mock_verification

        # Mock service
        mock_service = Mock()
        mock_service.verify_transcript.return_value = {
            'student_info': {'name_zh': '张三'},
            'metadata': {'status': 'completed'}
        }
        mock_service.generate_structured_transcript.return_value = 'Structured transcript'
        mock_get_service.return_value = mock_service

        response = client.post('/api/student-applications/transcript/verify/verify-123')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['verification_id'] == 'verify-123'
        assert data['data']['status'] == 'completed'
        assert 'verification_result' in data['data']
        assert 'structured_result' in data['data']
        assert data['message'] == 'Transcript verification completed successfully'

        # Check that verification was updated
        assert mock_verification.verification_result == {
            'student_info': {'name_zh': '张三'},
            'metadata': {'status': 'completed'}
        }
        assert mock_verification.structured_result == 'Structured transcript'
        assert mock_verification.status == 'completed'
        assert mock_verification.save.call_count == 2

    @patch('student_applications.routes.TranscriptVerification')
    def test_verify_transcript_not_found(self, mock_transcript_verification, client):
        """Test verification for non-existent transcript"""
        mock_transcript_verification.get_by_id.return_value = None

        response = client.post('/api/student-applications/transcript/verify/nonexistent')
        data = json.loads(response.data)

        assert response.status_code == 404
        assert data['success'] is False
        assert data['error']['code'] == 'NOT_FOUND'

    @patch('student_applications.routes.TranscriptVerification')
    @patch('student_applications.routes.get_transcript_service')
    def test_get_transcript_verification(self, mock_get_service, mock_transcript_verification, client):
        """Test getting transcript verification details"""
        mock_verification = Mock()
        mock_verification.to_dict.return_value = {'id': 'verify-123', 'status': 'completed'}
        mock_transcript_verification.get_by_id.return_value = mock_verification

        response = client.get('/api/student-applications/transcript/verify-123')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert data['data']['id'] == 'verify-123'
        assert data['data']['status'] == 'completed'

    @patch('student_applications.routes.TranscriptVerification')
    def test_list_transcript_verifications(self, mock_transcript_verification, client):
        """Test listing all transcript verifications"""
        mock_verification = Mock()
        mock_verification.to_dict.return_value = {'id': 'verify-123', 'status': 'completed'}
        mock_transcript_verification.get_all.return_value = [mock_verification]

        response = client.get('/api/student-applications/transcript')
        data = json.loads(response.data)

        assert response.status_code == 200
        assert data['success'] is True
        assert 'verifications' in data['data']
        assert len(data['data']['verifications']) == 1
        assert data['data']['count'] == 1

    def test_error_handlers(self, client):
        """Test error handlers"""
        # Test 404 handler
        response = client.get('/nonexistent-endpoint')
        data = json.loads(response.data)

        assert response.status_code == 404
        assert data['error'] == 'Not found'

        # Test 413 handler (file too large) - would be triggered by flask config
        # We can't easily test this without actually uploading a large file
        # but the handler is defined in app.py

        # Test 500 handler - test through an endpoint that throws an exception
        with patch('student_applications.routes.StudentApplication.get_all', side_effect=Exception('Test error')):
            response = client.get('/api/student-applications/')
            data = json.loads(response.data)

            assert response.status_code == 500
            assert data['success'] is False
            assert 'error' in data


class TestServiceInitialization:
    """Tests for service initialization"""

    @patch('student_applications.routes.StudentApplicationService')
    def test_get_service_lazy_initialization(self, mock_service_class):
        """Test lazy initialization of service"""
        from student_applications.routes import get_service, service

        # Reset global variable
        import student_applications.routes as routes_module
        routes_module.service = None

        # Mock service instance
        mock_service = Mock()
        mock_service_class.return_value = mock_service

        # First call should create service
        result = get_service()
        assert result == mock_service
        mock_service_class.assert_called_once()

        # Second call should return cached service
        mock_service_class.reset_mock()
        result2 = get_service()
        assert result2 == mock_service
        mock_service_class.assert_not_called()

    @patch('student_applications.routes.StudentApplicationService')
    def test_get_service_initialization_error(self, mock_service_class):
        """Test service initialization when API key is missing"""
        from student_applications.routes import get_service

        # Reset global variable
        import student_applications.routes as routes_module
        routes_module.service = None

        # Mock service to raise error
        mock_service_class.side_effect = ValueError('API key missing')

        result = get_service()

        # Should return a mock service that returns errors
        assert result is not None
        assert hasattr(result, 'analyze_documents')
        assert hasattr(result, 'generate_structured_summary')

        # The mock service should return error messages
        error_result = result.analyze_documents({})
        assert 'error' in error_result
        assert 'Google GenAI service not initialized' in error_result['error']

    @patch('student_applications.routes.TranscriptVerificationService')
    def test_get_transcript_service_lazy_initialization(self, mock_service_class):
        """Test lazy initialization of transcript service"""
        from student_applications.routes import get_transcript_service, transcript_service

        # Reset global variable
        import student_applications.routes as routes_module
        routes_module.transcript_service = None

        # Mock service instance
        mock_service = Mock()
        mock_service_class.return_value = mock_service

        # First call should create service
        result = get_transcript_service()
        assert result == mock_service
        mock_service_class.assert_called_once()

        # Second call should return cached service
        mock_service_class.reset_mock()
        result2 = get_transcript_service()
        assert result2 == mock_service
        mock_service_class.assert_not_called()