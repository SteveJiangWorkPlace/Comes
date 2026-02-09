"""
Service layer for student application analysis using Google GenAI
"""

import os
import json
import tempfile
from typing import Dict, Any, Optional

# Try to import Google GenAI with different possible import paths
try:
    import google.genai as genai
    GENAI_AVAILABLE = True
except ImportError:
    try:
        import genai
        GENAI_AVAILABLE = True
    except ImportError:
        GENAI_AVAILABLE = False
        print("Warning: google-genai library not available. Please install with: pip install google-genai")

from .utils import extract_text_from_file


class StudentApplicationService:
    """Service for processing student applications with Google GenAI"""

    def __init__(self):
        """Initialize Google GenAI client"""
        # Get API key from environment variable
        api_key = os.environ.get('GOOGLE_GENAI_API_KEY')

        if not GENAI_AVAILABLE:
            raise ImportError("google-genai library is not installed. Please install it with: pip install google-genai")

        if not api_key:
            raise ValueError("GOOGLE_GENAI_API_KEY environment variable is required")

        # Configure the client
        self.client = genai.Client(api_key=api_key)

        # Define the analysis prompt based on the template structure
        self.analysis_prompt = """你是一个专业的留学申请信息提取专家。请分析以下学生申请文件内容，提取关键信息并按照指定格式组织。

你需要分析的文件类型包括：
1. 成绩单 (Transcript) - 包含课程成绩、GPA等信息
2. 学位证书 (Degree Certificate) - 包含学位、专业、毕业时间等信息
3. 个人简历 (Resume) - 包含教育背景、工作经历、技能等信息
4. 雅思成绩单 (IELTS Score) - 包含语言考试成绩信息

请从这些文件中提取以下信息，并按照以下JSON格式返回：

{
  "applicant_info": {
    "name": "申请人姓名",
    "gender": "性别",
    "birth_date": "出生日期 (YYYY-MM-DD格式)",
    "passport_number": "护照号码",
    "passport_issue_date": "护照签发日期",
    "passport_expiry_date": "护照过期日期",
    "phone": "联系电话",
    "email": "申请邮箱",
    "password": "密码（如有）",
    "domestic_address": "国内家庭住址",
    "postal_code": "邮编"
  },
  "education_background": {
    "university": "所在院校",
    "major": "就读专业",
    "study_period": {
      "start_date": "起始年月",
      "end_date": "结束年月"
    },
    "expected_degree": "预计学位",
    "gpa": {
      "score": "绩点分数",
      "scale": "总分（如4.0或100）"
    }
  },
  "language_test": {
    "test_type": "考试类型（如：雅思/托福）",
    "test_date": "考试日期",
    "reference_number": "Reference Number",
    "total_score": "总分",
    "sections": {
      "listening": "听力分数",
      "reading": "阅读分数",
      "writing": "写作分数",
      "speaking": "口语分数"
    }
  },
  "work_experience": [
    {
      "company_name": "公司名称",
      "company_address": "公司地址",
      "position": "岗位名称",
      "work_period": {
        "start_date": "起始年月",
        "end_date": "结束年月"
      },
      "job_description": "工作内容描述"
    }
  ],
  "recommenders": [
    {
      "name": "推荐人姓名",
      "title": "职称",
      "relationship": "与申请人关系",
      "organization": "所在单位",
      "organization_address": "单位地址",
      "postal_code": "邮编",
      "email": "邮箱",
      "phone": "联系电话"
    }
  ]
}

如果某些信息无法从文件中找到，请将对应字段设为null。请确保提取的信息尽可能准确完整。"""

        self.summary_prompt = """根据分析结果，生成一个结构化的申请信息总结，使用以下模板格式：

# 申请信息梳理模板

---

## 一、 申请人信息 (Applicant Information)

### 1. 基本身份与联络信息
- **姓名/性别**: {name_gender}
- **出生日期**: {birth_date}
- **护照号码 (或身份证号码)**: {passport_number}
- **护照签发/过期日期**: {passport_issue_date} / {passport_expiry_date}
- **联系电话**: {phone}
- **申请邮箱**: {email}
- **密码**: {password}
- **国内家庭住址**: {domestic_address} (邮编: {postal_code})

### 2. 教育背景
- **所在院校**: {university}
- **就读专业**: {major}
- **就读时间**: {study_start} 至 {study_end}
- **预计学位**: {expected_degree}
- **绩点 (GPA)**: {gpa_score} / {gpa_scale}

### 3. 语言成绩
- **考试类型**: {test_type}
- **考试日期**: {test_date}
- **Reference Number**: {reference_number}
- **总分**: {total_score}
  - **听力**: {listening_score}
  - **阅读**: {reading_score}
  - **写作**: {writing_score}
  - **口语**: {speaking_score}

### 4. 实习或全职工作信息
{work_experience_section}

---

## 二、 推荐人信息 (Recommender Information)

{recommenders_section}

请用实际提取的信息填充模板中的占位符。如果某个信息缺失，请使用"信息缺失"或"未提供"标注。"""

    def _extract_document_texts(self, files: Dict[str, Any]) -> Dict[str, str]:
        """Extract text content from uploaded files"""
        document_texts = {}

        for file_key, file_info in files.items():
            filepath = file_info['filepath']
            content_type = file_info.get('content_type')

            try:
                text = extract_text_from_file(filepath, content_type)
                document_texts[file_key] = text
                print(f"Extracted {len(text)} characters from {file_key}")
            except Exception as e:
                print(f"Failed to extract text from {file_key}: {e}")
                document_texts[file_key] = ""

        return document_texts

    def _prepare_analysis_content(self, document_texts: Dict[str, str]) -> str:
        """Prepare content for GenAI analysis"""
        content_parts = []

        for file_key, text in document_texts.items():
            if file_key == 'transcript':
                content_parts.append(f"=== 成绩单 (Transcript) ===\n{text}\n")
            elif file_key == 'degree_certificate':
                content_parts.append(f"=== 学位证书 (Degree Certificate) ===\n{text}\n")
            elif file_key == 'resume':
                content_parts.append(f"=== 个人简历 (Resume) ===\n{text}\n")
            elif file_key == 'ielts_score':
                content_parts.append(f"=== 雅思成绩单 (IELTS Score) ===\n{text}\n")
            else:
                content_parts.append(f"=== {file_key} ===\n{text}\n")

        return "\n".join(content_parts)

    def analyze_documents(self, files: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze uploaded documents using Google GenAI"""
        try:
            # Check if GenAI is available
            if not GENAI_AVAILABLE:
                return {
                    "error": "Google GenAI library not available",
                    "message": "Please install google-genai library and set GOOGLE_GENAI_API_KEY environment variable"
                }
            # Step 1: Extract text from all documents
            print("Extracting text from documents...")
            document_texts = self._extract_document_texts(files)

            # Step 2: Prepare content for analysis
            print("Preparing content for GenAI analysis...")
            content = self._prepare_analysis_content(document_texts)

            # Step 3: Call Google GenAI for analysis
            print("Calling Google GenAI for analysis...")
            response = self.client.models.generate_content(
                model="gemini-pro",
                contents=[self.analysis_prompt, content],
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 4096,
                }
            )

            # Step 4: Parse the response
            result_text = response.text.strip()

            # Try to extract JSON from the response
            try:
                # Find JSON in the response (might be wrapped in markdown code blocks)
                if '```json' in result_text:
                    json_str = result_text.split('```json')[1].split('```')[0].strip()
                elif '```' in result_text:
                    json_str = result_text.split('```')[1].split('```')[0].strip()
                else:
                    json_str = result_text

                analysis_result = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON response: {e}")
                print(f"Response text: {result_text}")
                # Fallback: return raw text
                analysis_result = {
                    "raw_response": result_text,
                    "error": "Failed to parse JSON response"
                }

            return analysis_result

        except Exception as e:
            print(f"Error in document analysis: {e}")
            return {
                "error": str(e),
                "document_texts": {k: v[:100] + "..." if v else "" for k, v in document_texts.items()} if 'document_texts' in locals() else {}
            }

    def _format_work_experience_section(self, work_experience: list) -> str:
        """Format work experience section for summary template"""
        if not work_experience:
            return "**暂无工作经历信息**"

        sections = []
        for i, work in enumerate(work_experience, 1):
            section = f"""- **第{i}段经历**
  - **公司名称**: {work.get('company_name', '信息缺失')}
  - **公司地址**: {work.get('company_address', '信息缺失')}
  - **岗位名称**: {work.get('position', '信息缺失')}
  - **工作时间**: {work.get('work_period', {}).get('start_date', '信息缺失')} 至 {work.get('work_period', {}).get('end_date', '信息缺失')}
  - **工作内容描述**: {work.get('job_description', '信息缺失')}"""
            sections.append(section)

        return "\n\n".join(sections)

    def _format_recommenders_section(self, recommenders: list) -> str:
        """Format recommenders section for summary template"""
        if not recommenders:
            return "**暂无推荐人信息**"

        sections = []
        for i, recommender in enumerate(recommenders, 1):
            section = f"""### 推荐人 {i}
- **姓名**: {recommender.get('name', '信息缺失')}
- **职称**: {recommender.get('title', '信息缺失')}
- **与申请人关系**: {recommender.get('relationship', '信息缺失')}
- **所在单位**: {recommender.get('organization', '信息缺失')}
- **单位地址**: {recommender.get('organization_address', '信息缺失')} (邮编: {recommender.get('postal_code', '信息缺失')})
- **邮箱**: {recommender.get('email', '信息缺失')}
- **联系电话**: {recommender.get('phone', '信息缺失')}"""
            sections.append(section)

        return "\n\n".join(sections)

    def generate_structured_summary(self, analysis_result: Dict[str, Any]) -> str:
        """Generate structured summary based on analysis result"""
        try:
            # Extract data from analysis result
            applicant_info = analysis_result.get('applicant_info', {})
            education = analysis_result.get('education_background', {})
            language_test = analysis_result.get('language_test', {})
            work_experience = analysis_result.get('work_experience', [])
            recommenders = analysis_result.get('recommenders', [])

            # Prepare work experience section
            work_experience_section = self._format_work_experience_section(work_experience)

            # Prepare recommenders section
            recommenders_section = self._format_recommenders_section(recommenders)

            # Format the summary using the template
            summary = f"""# 申请信息梳理模板

---

## 一、 申请人信息 (Applicant Information)

### 1. 基本身份与联络信息
- **姓名/性别**: {applicant_info.get('name', '信息缺失')}/{applicant_info.get('gender', '信息缺失')}
- **出生日期**: {applicant_info.get('birth_date', '信息缺失')}
- **护照号码 (或身份证号码)**: {applicant_info.get('passport_number', '信息缺失')}
- **护照签发/过期日期**: {applicant_info.get('passport_issue_date', '信息缺失')} / {applicant_info.get('passport_expiry_date', '信息缺失')}
- **联系电话**: {applicant_info.get('phone', '信息缺失')}
- **申请邮箱**: {applicant_info.get('email', '信息缺失')}
- **密码**: {applicant_info.get('password', '信息缺失')}
- **国内家庭住址**: {applicant_info.get('domestic_address', '信息缺失')} (邮编: {applicant_info.get('postal_code', '信息缺失')})

### 2. 教育背景
- **所在院校**: {education.get('university', '信息缺失')}
- **就读专业**: {education.get('major', '信息缺失')}
- **就读时间**: {education.get('study_period', {}).get('start_date', '信息缺失')} 至 {education.get('study_period', {}).get('end_date', '信息缺失')}
- **预计学位**: {education.get('expected_degree', '信息缺失')}
- **绩点 (GPA)**: {education.get('gpa', {}).get('score', '信息缺失')} / {education.get('gpa', {}).get('scale', '信息缺失')}

### 3. 语言成绩
- **考试类型**: {language_test.get('test_type', '信息缺失')}
- **考试日期**: {language_test.get('test_date', '信息缺失')}
- **Reference Number**: {language_test.get('reference_number', '信息缺失')}
- **总分**: {language_test.get('total_score', '信息缺失')}
  - **听力**: {language_test.get('sections', {}).get('listening', '信息缺失')}
  - **阅读**: {language_test.get('sections', {}).get('reading', '信息缺失')}
  - **写作**: {language_test.get('sections', {}).get('writing', '信息缺失')}
  - **口语**: {language_test.get('sections', {}).get('speaking', '信息缺失')}

### 4. 实习或全职工作信息
{work_experience_section}

---

## 二、 推荐人信息 (Recommender Information)

{recommenders_section}"""

            return summary

        except Exception as e:
            print(f"Error generating structured summary: {e}")
            return f"生成结构化总结时出错: {str(e)}"