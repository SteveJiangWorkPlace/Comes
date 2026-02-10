"""
API routes for student application information processing
"""

import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from .services import StudentApplicationService, TranscriptVerificationService
from .models import StudentApplication, TranscriptVerification

student_bp = Blueprint('student_applications', __name__)
service = None

def get_service():
    """Lazy initialization of service to handle missing API key"""
    global service
    if service is None:
        try:
            service = StudentApplicationService()
        except (ValueError, ImportError) as e:
            # Log error but allow application to start
            print(f"Warning: Failed to initialize StudentApplicationService: {e}")
            print("File upload will work, but analysis will require GOOGLE_GENAI_API_KEY")
            # Create a mock service that returns errors when analysis is attempted
            class MockService:
                def analyze_documents(self, files):
                    return {"error": "Google GenAI service not initialized. Please set GOOGLE_GENAI_API_KEY environment variable."}
                def generate_structured_summary(self, analysis_result):
                    return "Google GenAI service not initialized. Please set GOOGLE_GENAI_API_KEY environment variable."
            service = MockService()
    return service

transcript_service = None

def get_transcript_service():
    """Lazy initialization of transcript verification service to handle missing API key"""
    global transcript_service
    if transcript_service is None:
        try:
            transcript_service = TranscriptVerificationService()
        except (ValueError, ImportError) as e:
            # Log error but allow application to start
            print(f"Warning: Failed to initialize TranscriptVerificationService: {e}")
            print("File upload will work, but verification will require GOOGLE_GENAI_API_KEY")
            # Create a mock service that returns errors when verification is attempted
            class MockTranscriptService:
                def verify_transcript(self, files, upload_type):
                    return {
                        "error": "Google GenAI service not initialized. Please set GOOGLE_GENAI_API_KEY environment variable.",
                        "metadata": {"status": "failed"}
                    }
                def generate_structured_transcript(self, verification_result):
                    return "Google GenAI service not initialized. Please set GOOGLE_GENAI_API_KEY environment variable."
            transcript_service = MockTranscriptService()
    return transcript_service

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@student_bp.route('/', methods=['GET'])
def list_applications():
    """List all processed applications"""
    applications = StudentApplication.get_all()
    return jsonify({
        'applications': [app.to_dict() for app in applications],
        'count': len(applications)
    })

@student_bp.route('/upload', methods=['POST'])
def upload_files():
    """
    Upload student application files
    Expected files: transcript, degree_certificate, resume, ielts_score
    """
    try:
        # Check if files are present
        required_files = ['transcript', 'degree_certificate', 'resume', 'ielts_score']
        missing_files = []
        uploaded_files = {}

        for file_key in required_files:
            if file_key not in request.files:
                missing_files.append(file_key)
                continue

            file = request.files[file_key]
            if file.filename == '':
                missing_files.append(file_key)
                continue

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                uploaded_files[file_key] = {
                    'filename': filename,
                    'filepath': filepath,
                    'content_type': file.content_type
                }
            else:
                return jsonify({
                    'error': f'File type not allowed for {file_key}',
                    'allowed_extensions': list(current_app.config['ALLOWED_EXTENSIONS'])
                }), 400

        if missing_files:
            return jsonify({
                'error': 'Missing required files',
                'missing_files': missing_files,
                'required_files': required_files
            }), 400

        # Create a new application record
        application = StudentApplication(
            files=uploaded_files,
            status='uploaded'
        )
        application.save()

        return jsonify({
            'message': 'Files uploaded successfully',
            'application_id': application.id,
            'uploaded_files': {k: v['filename'] for k, v in uploaded_files.items()},
            'next_step': {
                'analyze': f'/api/student-applications/analyze/{application.id}',
                'status': f'/api/student-applications/{application.id}'
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/analyze/<application_id>', methods=['POST'])
def analyze_application(application_id):
    """Analyze uploaded documents using Google GenAI"""
    try:
        application = StudentApplication.get_by_id(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        # Analyze the documents
        analysis_result = get_service().analyze_documents(application.files)

        # Update application with analysis results
        application.analysis_result = analysis_result
        application.status = 'analyzed'
        application.save()

        # Generate structured summary
        structured_summary = get_service().generate_structured_summary(analysis_result)
        application.structured_summary = structured_summary
        application.status = 'completed'
        application.save()

        return jsonify({
            'message': 'Analysis completed successfully',
            'application_id': application.id,
            'status': application.status,
            'analysis_summary': structured_summary
        }), 200

    except Exception as e:
        # Update application status to failed
        if 'application' in locals():
            application.status = 'failed'
            application.error_message = str(e)
            application.save()

        return jsonify({'error': str(e)}), 500

@student_bp.route('/<application_id>', methods=['GET'])
def get_application(application_id):
    """Get application details and analysis results"""
    try:
        application = StudentApplication.get_by_id(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404

        return jsonify(application.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/template', methods=['GET'])
def get_template():
    """Get the application information template"""
    template = """
# 申请信息梳理模板

---

## 一、 申请人信息 (Applicant Information)

### 1. 基本身份与联络信息
- **姓名/性别**: `[请填写]`
- **出生日期**: `[年-月-日]`
- **护照号码 (或身份证号码)**: `[请填写]`
- **护照签发/过期日期**: `[签发日期] / [过期日期]`
- **联系电话**: `[请填写]`
- **申请邮箱**: `[请填写]`
- **密码**: `[请填写]`
- **国内家庭住址**: `[请填写详细地址]` (邮编: `[请填写]`)

### 2. 教育背景
- **所在院校**: `[请填写]`
- **就读专业**: `[请填写]`
- **就读时间**: `[起始年月]` 至 `[结束年月]`
- **预计学位**: `[请填写]`
- **绩点 (GPA)**: `[绩点]` / `[总分]`

### 3. 语言成绩
- **考试类型**: `[如：雅思/托福]`
- **考试日期**: `[请填写]`
- **Reference Number**: `[请填写]`
- **总分**: `[分数]`
  - **听力**: `[分数]`
  - **阅读**: `[分数]`
  - **写作**: `[分数]`
  - **口语**: `[分数]`

### 4. 实习或全职工作信息
- **第一段经历**
  - **公司名称**: `[请填写]`
  - **公司地址**: `[请填写]`
  - **岗位名称**: `[请填写]`
  - **工作时间**: `[起始年月]` 至 `[结束年月]`
  - **工作内容描述**: `[请填写]`

- **第二段经历**
  - **公司名称**: `[请填写]`
  - **公司地址**: `[请填写]`
  - **岗位名称**: `[请填写]`
  - **工作时间**: `[起始年月]` 至 `[结束年月]`
  - **工作内容描述**: `[请填写]`

---

## 二、 推荐人信息 (Recommender Information)

### 推荐人 1
- **姓名**: `[请填写]`
- **职称**: `[请填写]`
- **与申请人关系**: `[请填写]`
- **所在单位**: `[请填写]`
- **单位地址**: `[请填写详细地址]` (邮编: `[请填写]`)
- **邮箱**: `[请填写]`
- **联系电话**: `[请填写]`

### 推荐人 2
- **姓名**: `[请填写]`
- **职称**: `[请填写]`
- **与申请人关系**: `[请填写]`
- **所在单位**: `[请填写]`
- **单位地址**: `[请填写详细地址]` (邮编: `[请填写]`)
- **邮箱**: `[请填写]`
- **联系电话**: `[请填写]`
    """

    return jsonify({'template': template}), 200


@student_bp.route('/transcript/upload', methods=['POST'])
def upload_transcript():
    """
    Upload transcript files for verification
    Expected files based on upload_type:
    - single: 'transcript' (bilingual)
    - separate: 'transcript_zh' and 'transcript_en'
    """
    try:
        # Get upload type from form data
        upload_type = request.form.get('upload_type', 'single')
        if upload_type not in ['single', 'separate']:
            return jsonify({'error': 'Invalid upload_type. Must be "single" or "separate"'}), 400

        # Determine required files based on upload type
        if upload_type == 'single':
            required_files = ['transcript']
        else:
            required_files = ['transcript_zh', 'transcript_en']

        missing_files = []
        uploaded_files = {}

        for file_key in required_files:
            if file_key not in request.files:
                missing_files.append(file_key)
                continue

            file = request.files[file_key]
            if file.filename == '':
                missing_files.append(file_key)
                continue

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                uploaded_files[file_key] = {
                    'filename': filename,
                    'filepath': filepath,
                    'content_type': file.content_type
                }
            else:
                return jsonify({
                    'error': f'File type not allowed for {file_key}',
                    'allowed_extensions': list(current_app.config['ALLOWED_EXTENSIONS'])
                }), 400

        if missing_files:
            return jsonify({
                'error': 'Missing required files',
                'missing_files': missing_files,
                'required_files': required_files
            }), 400

        # Create a new transcript verification record
        verification = TranscriptVerification(
            files=uploaded_files,
            upload_type=upload_type,
            status='uploaded'
        )
        verification.save()

        return jsonify({
            'message': 'Transcript files uploaded successfully',
            'verification_id': verification.id,
            'upload_type': upload_type,
            'uploaded_files': {k: v['filename'] for k, v in uploaded_files.items()},
            'next_step': {
                'verify': f'/api/student-applications/transcript/verify/{verification.id}',
                'status': f'/api/student-applications/transcript/{verification.id}'
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@student_bp.route('/transcript/verify/<verification_id>', methods=['POST'])
def verify_transcript(verification_id):
    """Verify uploaded transcript using Google GenAI"""
    try:
        verification = TranscriptVerification.get_by_id(verification_id)
        if not verification:
            return jsonify({'error': 'Transcript verification not found'}), 404

        # Verify the transcript
        verification_result = get_transcript_service().verify_transcript(
            verification.files,
            verification.upload_type
        )

        # Update verification with results
        verification.verification_result = verification_result
        verification.status = 'processing'
        verification.save()

        # Generate structured transcript summary
        structured_result = get_transcript_service().generate_structured_transcript(verification_result)
        verification.structured_result = structured_result
        verification.status = 'completed'
        verification.save()

        return jsonify({
            'message': 'Transcript verification completed successfully',
            'verification_id': verification.id,
            'status': verification.status,
            'verification_result': verification_result,
            'structured_result': structured_result
        }), 200

    except Exception as e:
        # Update verification status to failed
        if 'verification' in locals():
            verification.status = 'failed'
            verification.error_message = str(e)
            verification.save()

        return jsonify({'error': str(e)}), 500


@student_bp.route('/transcript/<verification_id>', methods=['GET'])
def get_transcript_verification(verification_id):
    """Get transcript verification details and results"""
    try:
        verification = TranscriptVerification.get_by_id(verification_id)
        if not verification:
            return jsonify({'error': 'Transcript verification not found'}), 404

        return jsonify(verification.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@student_bp.route('/transcript', methods=['GET'])
def list_transcript_verifications():
    """List all transcript verifications"""
    verifications = TranscriptVerification.get_all()
    return jsonify({
        'verifications': [v.to_dict() for v in verifications],
        'count': len(verifications)
    })