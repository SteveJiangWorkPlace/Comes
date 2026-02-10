"""
Pytest configuration and fixtures for Comes backend tests
"""
import os
import tempfile
import pytest
from typing import Generator, Dict, Any

# Add the backend directory to Python path
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(scope='session')
def app():
    """Create and configure a Flask app for testing"""
    # Set test environment variables
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['SECRET_KEY'] = 'test-secret-key'
    os.environ['GOOGLE_GENAI_API_KEY'] = 'test-api-key'  # Mock key for testing

    from app import create_app

    # Create a temporary directory for uploads
    with tempfile.TemporaryDirectory() as tmpdir:
        # Override upload folder for testing
        app = create_app()
        app.config.update({
            'TESTING': True,
            'DEBUG': True,
            'UPLOAD_FOLDER': tmpdir,
            'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB
            'ALLOWED_EXTENSIONS': {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx', 'txt'},
            'WTF_CSRF_ENABLED': False,  # Disable CSRF for testing
        })

        yield app


@pytest.fixture
def client(app):
    """Test client for making requests to the Flask app"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """CLI runner for testing Flask commands"""
    return app.test_cli_runner()


@pytest.fixture
def mock_files():
    """Create mock file upload data for testing"""
    from io import BytesIO

    def create_mock_file(filename: str, content: bytes = b'test content'):
        return (BytesIO(content), filename)

    return {
        'transcript': create_mock_file('transcript.pdf'),
        'degree_certificate': create_mock_file('degree.pdf'),
        'resume': create_mock_file('resume.docx'),
        'ielts_score': create_mock_file('ielts.pdf'),
    }


@pytest.fixture
def mock_transcript_files():
    """Create mock transcript files for testing"""
    from io import BytesIO

    def create_mock_file(filename: str, content: bytes = b'transcript content'):
        return (BytesIO(content), filename)

    return {
        'transcript': create_mock_file('transcript_bilingual.pdf'),
        'transcript_zh': create_mock_file('transcript_zh.pdf'),
        'transcript_en': create_mock_file('transcript_en.pdf'),
    }


@pytest.fixture
def sample_application_data() -> Dict[str, Any]:
    """Sample student application data for testing"""
    return {
        'applicant_info': {
            'name': '张三',
            'gender': '男',
            'birth_date': '2000-01-01',
            'passport_number': 'E12345678',
            'passport_issue_date': '2020-01-01',
            'passport_expiry_date': '2030-01-01',
            'phone': '+86 13800138000',
            'email': 'zhangsan@example.com',
            'password': 'password123',
            'domestic_address': '北京市海淀区',
            'postal_code': '100080',
        },
        'education_background': {
            'university': '清华大学',
            'major': '计算机科学与技术',
            'study_period': {
                'start_date': '2018-09-01',
                'end_date': '2022-06-30',
            },
            'expected_degree': '学士',
            'gpa': {
                'score': '3.8',
                'scale': '4.0',
            },
        },
        'language_test': {
            'test_type': '雅思',
            'test_date': '2023-05-15',
            'reference_number': 'IELTS123456',
            'total_score': '7.5',
            'sections': {
                'listening': '8.0',
                'reading': '7.5',
                'writing': '7.0',
                'speaking': '7.5',
            },
        },
        'work_experience': [
            {
                'company_name': '阿里巴巴',
                'company_address': '杭州市',
                'position': '软件开发工程师',
                'work_period': {
                    'start_date': '2022-07-01',
                    'end_date': '2023-12-31',
                },
                'job_description': '负责后端开发',
            }
        ],
        'recommenders': [
            {
                'name': '李四',
                'title': '教授',
                'relationship': '导师',
                'organization': '清华大学',
                'organization_address': '北京市海淀区',
                'postal_code': '100084',
                'email': 'lisi@tsinghua.edu.cn',
                'phone': '+86 13900139000',
            }
        ],
    }


@pytest.fixture
def sample_transcript_data() -> Dict[str, Any]:
    """Sample transcript verification data for testing"""
    return {
        'student_info': {
            'name_zh': '张三',
            'name_en': 'Zhang San',
            'student_id': '2018012345',
            'university': '清华大学',
            'major': '计算机科学与技术',
            'degree_level': '本科',
            'graduation_date': '2022-06-30',
            'overall_gpa': 3.8,
            'gpa_scale': 4.0,
        },
        'semesters': [
            {
                'name_zh': '2021秋季学期',
                'name_en': 'Fall 2021',
                'type': 'fall',
                'academic_year': '2021-2022',
                'start_date': '2021-09-01',
                'end_date': '2022-01-15',
                'courses': [
                    {
                        'name_zh': '数据结构',
                        'name_en': 'Data Structures',
                        'type': {'zh': '核心课程', 'en': 'Core Course', 'type': 'core'},
                        'credits': 3,
                        'grade': 'A',
                        'grade_points': 4.0,
                        'description': '数据结构基础课程',
                    }
                ],
                'total_credits': 15,
                'semester_gpa': 3.9,
            }
        ],
        'total_credits': 120,
        'academic_standing': '良好',
        'metadata': {
            'document_type': 'bilingual',
            'source_files': ['transcript.pdf'],
            'verified_at': '2024-01-01T00:00:00Z',
            'model_used': 'gemini-pro',
            'overall_confidence': 0.95,
            'processing_time': 1500,
            'status': 'completed',
        },
    }