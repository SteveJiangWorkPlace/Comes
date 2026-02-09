# Comes Backend - Student Application Information Module

Flask backend for processing student applications using Google GenAI.

## Features

- Upload student application documents (transcript, degree certificate, resume, IELTS score)
- Extract text from various file formats (PDF, DOCX, images, TXT)
- Analyze documents using Google GenAI to extract structured information
- Generate formatted application summaries based on template
- RESTful API with proper error handling

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and set your Google GenAI API key:

```
GOOGLE_GENAI_API_KEY=your-google-genai-api-key-here
```

### 3. Run the Application

```bash
python app.py
```

Or using Flask CLI:

```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Student Applications
- `GET /api/student-applications/` - List all applications
- `POST /api/student-applications/upload` - Upload application files
- `POST /api/student-applications/analyze/<application_id>` - Analyze uploaded documents
- `GET /api/student-applications/<application_id>` - Get application details
- `GET /api/student-applications/template` - Get application template

## File Upload

Required files for upload:
- `transcript` - Academic transcript
- `degree_certificate` - Degree certificate
- `resume` - Personal resume/CV
- `ielts_score` - IELTS test score report

Supported file formats:
- PDF (.pdf)
- Word documents (.docx, .doc)
- Text files (.txt)
- Images (.png, .jpg, .jpeg, .bmp, .tiff)

Maximum file size: 16MB

## Google GenAI Integration

The application uses Google GenAI to analyze documents and extract structured information. You need:

1. A Google GenAI API key
2. The `google-genai` Python library (included in requirements.txt)

The AI analysis extracts:
- Applicant personal information
- Education background
- Language test scores
- Work experience
- Recommender information

## Development

### Project Structure

```
backend/
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
├── student_applications/    # Student application module
│   ├── __init__.py
│   ├── routes.py           # API routes
│   ├── services.py         # GenAI integration service
│   ├── models.py           # Data models
│   └── utils.py            # Document processing utilities
└── uploads/                 # File upload directory (auto-created)
```

### Testing the API

You can use curl or tools like Postman to test the API:

1. **Upload files**:
```bash
curl -X POST \
  -F "transcript=@transcript.pdf" \
  -F "degree_certificate=@degree.pdf" \
  -F "resume=@resume.docx" \
  -F "ielts_score=@ielts.pdf" \
  http://localhost:5000/api/student-applications/upload
```

2. **Analyze documents**:
```bash
curl -X POST \
  http://localhost:5000/api/student-applications/analyze/{application_id}
```

3. **Get results**:
```bash
curl http://localhost:5000/api/student-applications/{application_id}
```

## Deployment

### Render Deployment

The project includes a `render.yaml` configuration file for deployment on Render:

1. Connect your GitHub repository to Render
2. Select the `backend/` directory
3. Render will automatically detect the Python application
4. Set environment variables in Render dashboard

### Docker Deployment (Optional)

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
```

## Troubleshooting

### Common Issues

1. **Google GenAI not installed**:
   ```bash
   pip install google-genai
   ```

2. **API key not set**:
   - Ensure `.env` file exists with `GOOGLE_GENAI_API_KEY`
   - Or set environment variable directly

3. **File upload errors**:
   - Check file size (max 16MB)
   - Verify file format is supported
   - Ensure uploads directory is writable

4. **Text extraction fails**:
   - Install OCR dependencies for image processing:
   ```bash
   sudo apt-get install tesseract-ocr  # Linux
   brew install tesseract              # macOS
   ```

### Debug Mode

Enable debug mode for detailed error messages:

```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

## Security Notes

- Never commit `.env` files to version control
- Use strong secret keys in production
- Validate all file uploads for security
- Implement proper authentication for production use
- Regularly update dependencies for security patches