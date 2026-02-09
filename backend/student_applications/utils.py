"""
Utility functions for document processing and text extraction
"""

import os
import tempfile
from typing import Optional, Dict, Any
import io

# Optional imports for document processing
try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    print("Warning: PyPDF2 not available. PDF extraction may be limited.")

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    print("Warning: pdfplumber not available. PDF extraction may be limited.")

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("Warning: python-docx not available. DOCX extraction will not work.")

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False
    print("Warning: Pillow not available. Image processing will not work.")

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("Warning: pytesseract not available. OCR extraction will not work.")

def extract_text_from_pdf(filepath: str) -> str:
    """Extract text from PDF file using multiple methods for better coverage"""
    text = ""

    # Method 1: PyPDF2 for basic text extraction
    if PYPDF2_AVAILABLE:
        try:
            with open(filepath, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"PyPDF2 extraction failed: {e}")
    else:
        print("PyPDF2 not available for PDF extraction")

    # If PyPDF2 didn't extract much text, try pdfplumber
    if PDFPLUMBER_AVAILABLE and len(text.strip()) < 100:
        try:
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"pdfplumber extraction failed: {e}")
    elif not PDFPLUMBER_AVAILABLE and len(text.strip()) < 100:
        print("pdfplumber not available for PDF extraction")

    return text.strip()

def extract_text_from_docx(filepath: str) -> str:
    """Extract text from Word document"""
    if not DOCX_AVAILABLE:
        print("python-docx not available for DOCX extraction")
        return ""

    try:
        doc = docx.Document(filepath)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return "\n".join(full_text)
    except Exception as e:
        print(f"DOCX extraction failed: {e}")
        return ""

def extract_text_from_image(filepath: str) -> str:
    """Extract text from image using OCR"""
    if not PILLOW_AVAILABLE:
        print("Pillow not available for image processing")
        return ""

    if not TESSERACT_AVAILABLE:
        print("pytesseract not available for OCR extraction")
        return ""

    try:
        # Check if pytesseract is available
        pytesseract.get_tesseract_version()

        image = Image.open(filepath)
        text = pytesseract.image_to_string(image, lang='eng+chi_sim')
        return text.strip()
    except Exception as e:
        print(f"OCR extraction failed: {e}")
        return ""

def extract_text_from_txt(filepath: str) -> str:
    """Extract text from plain text file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        # Try different encodings
        encodings = ['latin-1', 'iso-8859-1', 'cp1252']
        for encoding in encodings:
            try:
                with open(filepath, 'r', encoding=encoding) as file:
                    return file.read()
            except:
                continue
        return ""

def extract_text_from_file(filepath: str, content_type: str = None) -> str:
    """Extract text from any supported file type"""
    filename = filepath.lower()

    if filename.endswith('.pdf'):
        return extract_text_from_pdf(filepath)
    elif filename.endswith('.docx') or filename.endswith('.doc'):
        return extract_text_from_docx(filepath)
    elif filename.endswith('.txt'):
        return extract_text_from_txt(filepath)
    elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif')):
        return extract_text_from_image(filepath)
    else:
        # Try to determine from content type
        if content_type:
            if 'pdf' in content_type:
                return extract_text_from_pdf(filepath)
            elif 'word' in content_type or 'document' in content_type:
                return extract_text_from_docx(filepath)
            elif 'text' in content_type:
                return extract_text_from_txt(filepath)
            elif 'image' in content_type:
                return extract_text_from_image(filepath)

    # Fallback: try as text file
    try:
        return extract_text_from_txt(filepath)
    except:
        return ""

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return os.path.splitext(filename)[1].lower().replace('.', '')

def is_supported_file_type(filename: str) -> bool:
    """Check if file type is supported for text extraction"""
    supported_extensions = {'.pdf', '.docx', '.doc', '.txt', '.png', '.jpg', '.jpeg', '.bmp', '.tiff'}
    ext = os.path.splitext(filename)[1].lower()
    return ext in supported_extensions