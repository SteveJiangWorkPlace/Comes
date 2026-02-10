"""
Tests for student application services
"""
import os
import json
import pytest
from unittest.mock import Mock, patch, mock_open, MagicMock
from datetime import datetime

from student_applications.services import StudentApplicationService, TranscriptVerificationService


class TestStudentApplicationService:
    """Tests for StudentApplicationService"""

    @pytest.fixture
    def mock_genai_client(self):
        """Mock Google GenAI client"""
        with patch('student_applications.services.genai') as mock_genai:
            mock_client = Mock()
            mock_genai.Client.return_value = mock_client
            mock_genai_client = mock_client
            yield mock_genai_client

    @pytest.fixture
    def service(self, mock_genai_client):
        """Create service instance with mocked dependencies"""
        os.environ['GOOGLE_GENAI_API_KEY'] = 'test-api-key'
        return StudentApplicationService()

    @pytest.fixture
    def mock_files(self, tmp_path):
        """Create mock file data for testing"""
        files = {}
        file_keys = ['transcript', 'degree_certificate', 'resume', 'ielts_score']

        for key in file_keys:
            filepath = tmp_path / f"{key}.pdf"
            filepath.write_bytes(b"test content")
            files[key] = {
                'filename': f"{key}.pdf",
                'filepath': str(filepath),
                'content_type': 'application/pdf'
            }

        return files

    def test_init_without_api_key(self):
        """Test service initialization without API key"""
        if 'GOOGLE_GENAI_API_KEY' in os.environ:
            del os.environ['GOOGLE_GENAI_API_KEY']

        with pytest.raises(ValueError, match='GOOGLE_GENAI_API_KEY environment variable is required'):
            StudentApplicationService()

    def test_init_with_missing_genai_library(self):
        """Test service initialization when google-genai is not available"""
        with patch('student_applications.services.GENAI_AVAILABLE', False):
            with pytest.raises(ImportError, match='google-genai library is not installed'):
                StudentApplicationService()

    def test_extract_document_texts(self, service, mock_files):
        """Test text extraction from files"""
        # Mock extract_text_from_file to return sample text
        with patch('student_applications.services.extract_text_from_file') as mock_extract:
            mock_extract.return_value = "Sample text content"

            result = service._extract_document_texts(mock_files)

            # Check that extract_text_from_file was called for each file
            assert mock_extract.call_count == 4
            assert set(result.keys()) == set(mock_files.keys())
            for key in mock_files.keys():
                assert result[key] == "Sample text content"

    def test_extract_document_texts_with_error(self, service, mock_files):
        """Test text extraction when extraction fails"""
        with patch('student_applications.services.extract_text_from_file') as mock_extract:
            mock_extract.side_effect = Exception("Extraction failed")

            result = service._extract_document_texts(mock_files)

            # Should return empty strings for failed extractions
            for key in mock_files.keys():
                assert result[key] == ""

    def test_prepare_analysis_content(self, service):
        """Test preparation of analysis content"""
        document_texts = {
            'transcript': 'Transcript text',
            'degree_certificate': 'Degree certificate text',
            'resume': 'Resume text',
            'ielts_score': 'IELTS text',
            'other_file': 'Other text'
        }

        content = service._prepare_analysis_content(document_texts)

        # Check that content includes all sections with proper labels
        assert '=== 成绩单 (Transcript) ===' in content
        assert '=== 学位证书 (Degree Certificate) ===' in content
        assert '=== 个人简历 (Resume) ===' in content
        assert '=== 雅思成绩单 (IELTS Score) ===' in content
        assert '=== other_file ===' in content
        assert 'Transcript text' in content
        assert 'Degree certificate text' in content

    def test_analyze_documents_success(self, service, mock_files, mock_genai_client):
        """Test successful document analysis"""
        # Mock text extraction
        with patch.object(service, '_extract_document_texts') as mock_extract:
            mock_extract.return_value = {
                'transcript': 'Transcript text',
                'degree_certificate': 'Degree certificate text',
                'resume': 'Resume text',
                'ielts_score': 'IELTS text'
            }

            # Mock GenAI response
            mock_response = Mock()
            expected_result = {
                'applicant_info': {
                    'name': '张三',
                    'gender': '男',
                    'birth_date': '2000-01-01'
                },
                'education_background': {
                    'university': '清华大学',
                    'major': '计算机科学与技术'
                }
            }
            mock_response.text = json.dumps(expected_result)
            mock_genai_client.models.generate_content.return_value = mock_response

            result = service.analyze_documents(mock_files)

            # Check that GenAI was called
            assert mock_genai_client.models.generate_content.called
            # Check that result matches expected
            assert result == expected_result

    def test_analyze_documents_with_json_in_markdown(self, service, mock_files, mock_genai_client):
        """Test analysis with JSON wrapped in markdown code blocks"""
        with patch.object(service, '_extract_document_texts') as mock_extract:
            mock_extract.return_value = {
                'transcript': 'Transcript text',
                'degree_certificate': 'Degree certificate text',
                'resume': 'Resume text',
                'ielts_score': 'IELTS text'
            }

            mock_response = Mock()
            expected_result = {'test': 'data'}
            # Response with JSON in markdown code block
            mock_response.text = "Here is the analysis:\n```json\n" + json.dumps(expected_result) + "\n```"
            mock_genai_client.models.generate_content.return_value = mock_response

            result = service.analyze_documents(mock_files)

            assert result == expected_result

    def test_analyze_documents_json_parse_error(self, service, mock_files, mock_genai_client):
        """Test analysis when JSON parsing fails"""
        with patch.object(service, '_extract_document_texts') as mock_extract:
            mock_extract.return_value = {
                'transcript': 'Transcript text',
                'degree_certificate': 'Degree certificate text',
                'resume': 'Resume text',
                'ielts_score': 'IELTS text'
            }

            mock_response = Mock()
            # Invalid JSON response
            mock_response.text = "Not a valid JSON"
            mock_genai_client.models.generate_content.return_value = mock_response

            result = service.analyze_documents(mock_files)

            # Should return error in result
            assert 'error' in result
            assert result['error'] == 'Failed to parse JSON response'
            assert 'raw_response' in result

    def test_analyze_documents_genai_not_available(self, service, mock_files):
        """Test analysis when GenAI is not available"""
        with patch('student_applications.services.GENAI_AVAILABLE', False):
            result = service.analyze_documents(mock_files)

            assert 'error' in result
            assert 'Google GenAI library not available' in result['error']

    def test_analyze_documents_exception(self, service, mock_files):
        """Test analysis when exception occurs"""
        with patch.object(service, '_extract_document_texts') as mock_extract:
            mock_extract.side_effect = Exception("Extraction failed")

            result = service.analyze_documents(mock_files)

            assert 'error' in result
            assert 'Extraction failed' in result['error']

    def test_format_work_experience_section(self, service):
        """Test formatting work experience section"""
        # Empty work experience
        result = service._format_work_experience_section([])
        assert result == "**暂无工作经历信息**"

        # With work experience
        work_experience = [
            {
                'company_name': 'Company A',
                'company_address': 'Address A',
                'position': 'Developer',
                'work_period': {
                    'start_date': '2020-01-01',
                    'end_date': '2021-01-01'
                },
                'job_description': 'Developed software'
            },
            {
                'company_name': 'Company B',
                'position': 'Manager',
                'work_period': {
                    'start_date': '2021-02-01',
                    'end_date': '2022-02-01'
                }
            }
        ]

        result = service._format_work_experience_section(work_experience)

        assert '第1段经历' in result
        assert '第2段经历' in result
        assert 'Company A' in result
        assert 'Company B' in result
        assert '信息缺失' in result  # For missing company_address in second item

    def test_format_recommenders_section(self, service):
        """Test formatting recommenders section"""
        # Empty recommenders
        result = service._format_recommenders_section([])
        assert result == "**暂无推荐人信息**"

        # With recommenders
        recommenders = [
            {
                'name': 'Recommender A',
                'title': 'Professor',
                'relationship': 'Advisor',
                'organization': 'University A',
                'organization_address': 'Address A',
                'postal_code': '100000',
                'email': 'recommender@example.com',
                'phone': '+86 13800138000'
            }
        ]

        result = service._format_recommenders_section(recommenders)

        assert '推荐人 1' in result
        assert 'Recommender A' in result
        assert 'Professor' in result
        assert 'University A' in result

    def test_generate_structured_summary(self, service):
        """Test generation of structured summary"""
        analysis_result = {
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
                'postal_code': '100080'
            },
            'education_background': {
                'university': '清华大学',
                'major': '计算机科学与技术',
                'study_period': {
                    'start_date': '2018-09-01',
                    'end_date': '2022-06-30'
                },
                'expected_degree': '学士',
                'gpa': {
                    'score': '3.8',
                    'scale': '4.0'
                }
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
                    'speaking': '7.5'
                }
            },
            'work_experience': [
                {
                    'company_name': '阿里巴巴',
                    'company_address': '杭州市',
                    'position': '软件开发工程师',
                    'work_period': {
                        'start_date': '2022-07-01',
                        'end_date': '2023-12-31'
                    },
                    'job_description': '负责后端开发'
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
                    'phone': '+86 13900139000'
                }
            ]
        }

        summary = service.generate_structured_summary(analysis_result)

        # Check that summary contains all sections
        assert '# 申请信息梳理模板' in summary
        assert '## 一、 申请人信息' in summary
        assert '## 二、 推荐人信息' in summary
        assert '张三' in summary
        assert '清华大学' in summary
        assert '阿里巴巴' in summary
        assert '李四' in summary

    def test_generate_structured_summary_with_missing_data(self, service):
        """Test summary generation with missing data"""
        analysis_result = {
            'applicant_info': {},
            'education_background': {},
            'language_test': {},
            'work_experience': [],
            'recommenders': []
        }

        summary = service.generate_structured_summary(analysis_result)

        # Should still generate template with "信息缺失" placeholders
        assert '信息缺失' in summary

    def test_generate_structured_summary_error(self, service):
        """Test summary generation when error occurs"""
        # Pass invalid data to trigger exception
        summary = service.generate_structured_summary({'invalid': 'data'})

        assert '生成结构化总结时出错' in summary


class TestTranscriptVerificationService:
    """Tests for TranscriptVerificationService"""

    @pytest.fixture
    def mock_genai_client(self):
        """Mock Google GenAI client"""
        with patch('student_applications.services.genai') as mock_genai:
            mock_client = Mock()
            mock_genai.Client.return_value = mock_client
            mock_genai_client = mock_client
            yield mock_genai_client

    @pytest.fixture
    def transcript_service(self, mock_genai_client):
        """Create transcript service instance"""
        os.environ['GOOGLE_GENAI_API_KEY'] = 'test-api-key'
        return TranscriptVerificationService()

    @pytest.fixture
    def mock_transcript_files(self, tmp_path):
        """Create mock transcript file data"""
        files = {
            'transcript': {
                'filename': 'transcript.pdf',
                'filepath': str(tmp_path / 'transcript.pdf'),
                'content_type': 'application/pdf'
            }
        }
        (tmp_path / 'transcript.pdf').write_bytes(b"transcript content")
        return files

    @pytest.fixture
    def mock_separate_transcript_files(self, tmp_path):
        """Create mock separate transcript files"""
        files = {
            'transcript_zh': {
                'filename': 'transcript_zh.pdf',
                'filepath': str(tmp_path / 'transcript_zh.pdf'),
                'content_type': 'application/pdf'
            },
            'transcript_en': {
                'filename': 'transcript_en.pdf',
                'filepath': str(tmp_path / 'transcript_en.pdf'),
                'content_type': 'application/pdf'
            }
        }
        (tmp_path / 'transcript_zh.pdf').write_bytes(b"Chinese transcript content")
        (tmp_path / 'transcript_en.pdf').write_bytes(b"English transcript content")
        return files

    def test_init_without_api_key(self):
        """Test service initialization without API key"""
        if 'GOOGLE_GENAI_API_KEY' in os.environ:
            del os.environ['GOOGLE_GENAI_API_KEY']

        with pytest.raises(ValueError, match='GOOGLE_GENAI_API_KEY environment variable is required'):
            TranscriptVerificationService()

    def test_extract_transcript_texts(self, transcript_service, mock_transcript_files):
        """Test text extraction from transcript files"""
        with patch('student_applications.services.extract_text_from_file') as mock_extract:
            mock_extract.return_value = "Extracted text"

            result = transcript_service._extract_transcript_texts(mock_transcript_files, 'single')

            assert mock_extract.called
            assert 'transcript' in result
            assert result['transcript'] == "Extracted text"

    def test_prepare_transcript_content_single(self, transcript_service):
        """Test content preparation for single bilingual transcript"""
        transcript_texts = {
            'transcript': 'Bilingual transcript text'
        }

        content = transcript_service._prepare_transcript_content(transcript_texts, 'single')

        assert '=== 成绩单文件: transcript ===' in content
        assert 'Bilingual transcript text' in content

    def test_prepare_transcript_content_separate(self, transcript_service):
        """Test content preparation for separate transcripts"""
        transcript_texts = {
            'transcript_zh': '中文成绩单内容',
            'transcript_en': 'English transcript content'
        }

        content = transcript_service._prepare_transcript_content(transcript_texts, 'separate')

        assert '=== 中文成绩单 ===' in content
        assert '=== 英文成绩单 ===' in content
        assert '中文成绩单内容' in content
        assert 'English transcript content' in content

    def test_verify_transcript_success(self, transcript_service, mock_transcript_files, mock_genai_client):
        """Test successful transcript verification"""
        with patch.object(transcript_service, '_extract_transcript_texts') as mock_extract:
            mock_extract.return_value = {'transcript': 'Transcript text'}

            # Mock GenAI response
            mock_response = Mock()
            expected_result = {
                'student_info': {
                    'name_zh': '张三',
                    'name_en': 'Zhang San',
                    'student_id': '2018012345'
                },
                'semesters': [],
                'academic_summary': {}
            }
            mock_response.text = json.dumps(expected_result)
            mock_genai_client.models.generate_content.return_value = mock_response

            result = transcript_service.verify_transcript(mock_transcript_files, 'single')

            assert mock_genai_client.models.generate_content.called
            assert 'student_info' in result
            assert 'metadata' in result
            assert result['metadata']['document_type'] == 'bilingual'
            assert result['metadata']['status'] == 'completed'

    def test_verify_transcript_separate_files(self, transcript_service, mock_separate_transcript_files, mock_genai_client):
        """Test verification with separate transcript files"""
        with patch.object(transcript_service, '_extract_transcript_texts') as mock_extract:
            mock_extract.return_value = {
                'transcript_zh': '中文内容',
                'transcript_en': 'English content'
            }

            mock_response = Mock()
            expected_result = {
                'student_info': {'name_zh': '张三', 'name_en': 'Zhang San'},
                'semesters': [],
                'academic_summary': {}
            }
            mock_response.text = json.dumps(expected_result)
            mock_genai_client.models.generate_content.return_value = mock_response

            result = transcript_service.verify_transcript(mock_separate_transcript_files, 'separate')

            assert 'metadata' in result
            assert result['metadata']['document_type'] == 'separate'

    def test_verify_transcript_json_parse_error(self, transcript_service, mock_transcript_files, mock_genai_client):
        """Test verification when JSON parsing fails"""
        with patch.object(transcript_service, '_extract_transcript_texts') as mock_extract:
            mock_extract.return_value = {'transcript': 'Transcript text'}

            mock_response = Mock()
            mock_response.text = "Invalid JSON"
            mock_genai_client.models.generate_content.return_value = mock_response

            result = transcript_service.verify_transcript(mock_transcript_files, 'single')

            assert 'error' in result
            assert 'Failed to parse JSON response' in result['error']
            assert result['metadata']['status'] == 'failed'

    def test_verify_transcript_genai_not_available(self, transcript_service, mock_transcript_files):
        """Test verification when GenAI is not available"""
        with patch('student_applications.services.GENAI_AVAILABLE', False):
            result = transcript_service.verify_transcript(mock_transcript_files, 'single')

            assert 'error' in result
            assert 'Google GenAI library not available' in result['error']

    def test_generate_structured_transcript(self, transcript_service):
        """Test generation of structured transcript summary"""
        verification_result = {
            'student_info': {
                'name_zh': '张三',
                'name_en': 'Zhang San',
                'student_id': '2018012345',
                'university': '清华大学',
                'major': '计算机科学与技术',
                'degree_level': '本科',
                'graduation_date': '2022-06',
                'overall_gpa': 3.8,
                'gpa_scale': 4.0
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
                            'code': 'CS101',
                            'course_type': {
                                'type': 'core',
                                'zh': '核心课程',
                                'en': 'Core Course'
                            },
                            'credits': 3,
                            'grade': 'A',
                            'grade_points': 4.0,
                            'description': '数据结构基础课程'
                        }
                    ],
                    'total_credits': 15,
                    'semester_gpa': 3.9
                }
            ],
            'academic_summary': {
                'total_credits': 120,
                'total_courses': 40,
                'academic_standing': '良好',
                'verification_notes': '成绩单认证通过'
            },
            'metadata': {
                'verified_at': '2024-01-01T00:00:00Z',
                'model_used': 'gemini-pro',
                'document_type': 'bilingual',
                'status': 'completed'
            }
        }

        structured = transcript_service.generate_structured_transcript(verification_result)

        assert '# 成绩单认证报告' in structured
        assert '## 一、 学生基本信息' in structured
        assert '## 二、 学期课程信息' in structured
        assert '## 三、 学业总览' in structured
        assert '## 四、 认证信息' in structured
        assert '张三' in structured
        assert 'Zhang San' in structured
        assert '清华大学' in structured
        assert '数据结构' in structured
        assert 'Data Structures' in structured

    def test_generate_structured_transcript_with_missing_data(self, transcript_service):
        """Test structured transcript generation with missing data"""
        verification_result = {
            'student_info': {},
            'semesters': [],
            'academic_summary': {}
        }

        structured = transcript_service.generate_structured_transcript(verification_result)

        assert '未提供' in structured

    def test_generate_structured_transcript_error(self, transcript_service):
        """Test structured transcript generation when error occurs"""
        # Pass invalid data to trigger exception
        structured = transcript_service.generate_structured_transcript({'invalid': 'data'})

        assert '生成结构化成绩单时出错' in structured