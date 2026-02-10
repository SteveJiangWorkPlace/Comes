"""
Tests for utility functions in student_applications.utils
"""
import os
import tempfile
from pathlib import Path
import pytest
from unittest.mock import Mock, patch, mock_open


class TestFileExtensionUtils:
    """Tests for file extension utility functions"""

    def test_get_file_extension(self):
        """Test getting file extension from filename"""
        from student_applications.utils import get_file_extension

        assert get_file_extension('document.pdf') == 'pdf'
        assert get_file_extension('image.jpg') == 'jpg'
        assert get_file_extension('file.with.dots.docx') == 'docx'
        assert get_file_extension('noextension') == ''

    def test_is_supported_file_type(self):
        """Test checking if file type is supported"""
        from student_applications.utils import is_supported_file_type

        # Supported extensions
        assert is_supported_file_type('document.pdf') is True
        assert is_supported_file_type('image.png') is True
        assert is_supported_file_type('resume.docx') is True
        assert is_supported_file_type('data.txt') is True
        assert is_supported_file_type('photo.jpg') is True

        # Unsupported extensions
        assert is_supported_file_type('script.js') is False
        assert is_supported_file_type('data.csv') is False
        assert is_supported_file_type('archive.zip') is False


class TestTextExtraction:
    """Tests for text extraction functions"""

    @pytest.fixture
    def temp_pdf_file(self):
        """Create a temporary PDF file for testing"""
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            # Write minimal PDF content
            f.write(b'%PDF-1.4\n%Test PDF\n')
            temp_path = f.name
        yield temp_path
        os.unlink(temp_path)

    @pytest.fixture
    def temp_txt_file(self):
        """Create a temporary text file for testing"""
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False, mode='w', encoding='utf-8') as f:
            f.write('This is test text content.\nWith multiple lines.')
            temp_path = f.name
        yield temp_path
        os.unlink(temp_path)

    def test_extract_text_from_txt_utf8(self, temp_txt_file):
        """Test extracting text from UTF-8 text file"""
        from student_applications.utils import extract_text_from_txt

        text = extract_text_from_txt(temp_txt_file)
        assert 'This is test text content.' in text
        assert 'With multiple lines.' in text

    def test_extract_text_from_txt_latin1(self):
        """Test extracting text from Latin-1 encoded file"""
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as f:
            # Latin-1 encoded content
            f.write(b'Latin-1 text: \xe9\xe0\xe7')  # éàç in Latin-1
            temp_path = f.name

        try:
            from student_applications.utils import extract_text_from_txt
            text = extract_text_from_txt(temp_path)
            # The function should handle the encoding
            assert text is not None
        finally:
            os.unlink(temp_path)

    def test_extract_text_from_txt_file_not_found(self):
        """Test extracting text from non-existent file"""
        from student_applications.utils import extract_text_from_txt

        text = extract_text_from_txt('/nonexistent/file.txt')
        assert text == ''

    @patch('student_applications.utils.PYPDF2_AVAILABLE', True)
    @patch('student_applications.utils.PyPDF2.PdfReader')
    def test_extract_text_from_pdf_pypdf2(self, mock_pdf_reader):
        """Test PDF text extraction with PyPDF2"""
        from student_applications.utils import extract_text_from_pdf

        # Mock PyPDF2 reader
        mock_page1 = Mock()
        mock_page1.extract_text.return_value = 'Page 1 text'
        mock_page2 = Mock()
        mock_page2.extract_text.return_value = 'Page 2 text'

        mock_reader = Mock()
        mock_reader.pages = [mock_page1, mock_page2]

        mock_pdf_reader.return_value = mock_reader

        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            temp_path = f.name

        try:
            with patch('builtins.open', mock_open(read_data=b'PDF content')):
                text = extract_text_from_pdf(temp_path)
                assert 'Page 1 text' in text
                assert 'Page 2 text' in text
                assert mock_pdf_reader.called
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    @patch('student_applications.utils.PYPDF2_AVAILABLE', False)
    def test_extract_text_from_pdf_no_pypdf2(self):
        """Test PDF extraction when PyPDF2 is not available"""
        from student_applications.utils import extract_text_from_pdf

        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            temp_path = f.name

        try:
            text = extract_text_from_pdf(temp_path)
            assert text == ''
        finally:
            os.unlink(temp_path)

    @patch('student_applications.utils.DOCX_AVAILABLE', True)
    @patch('student_applications.utils.docx.Document')
    def test_extract_text_from_docx(self, mock_document):
        """Test DOCX text extraction"""
        from student_applications.utils import extract_text_from_docx

        # Mock docx document
        mock_doc = Mock()
        mock_para1 = Mock()
        mock_para1.text = 'First paragraph'
        mock_para2 = Mock()
        mock_para2.text = 'Second paragraph'
        mock_doc.paragraphs = [mock_para1, mock_para2]

        mock_document.return_value = mock_doc

        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as f:
            temp_path = f.name

        try:
            text = extract_text_from_docx(temp_path)
            assert 'First paragraph' in text
            assert 'Second paragraph' in text
            assert mock_document.called
        finally:
            os.unlink(temp_path)

    @patch('student_applications.utils.DOCX_AVAILABLE', False)
    def test_extract_text_from_docx_not_available(self):
        """Test DOCX extraction when python-docx is not available"""
        from student_applications.utils import extract_text_from_docx

        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as f:
            temp_path = f.name

        try:
            text = extract_text_from_docx(temp_path)
            assert text == ''
        finally:
            os.unlink(temp_path)

    @patch('student_applications.utils.PILLOW_AVAILABLE', True)
    @patch('student_applications.utils.TESSERACT_AVAILABLE', True)
    @patch('student_applications.utils.pytesseract')
    @patch('student_applications.utils.Image')
    def test_extract_text_from_image(self, mock_image, mock_pytesseract):
        """Test image text extraction with OCR"""
        from student_applications.utils import extract_text_from_image

        # Mock PIL Image and pytesseract
        mock_img = Mock()
        mock_image.open.return_value = mock_img
        mock_pytesseract.get_tesseract_version.return_value = None  # Mock version check
        mock_pytesseract.image_to_string.return_value = 'Extracted text from image'

        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            temp_path = f.name

        try:
            text = extract_text_from_image(temp_path)
            assert text == 'Extracted text from image'
            mock_image.open.assert_called_with(temp_path)
            mock_pytesseract.image_to_string.assert_called_with(
                mock_img, lang='eng+chi_sim'
            )
        finally:
            os.unlink(temp_path)

    def test_extract_text_from_file_by_extension(self):
        """Test extract_text_from_file routing by file extension"""
        from student_applications.utils import extract_text_from_file

        test_cases = [
            ('.pdf', 'extract_text_from_pdf'),
            ('.docx', 'extract_text_from_docx'),
            ('.doc', 'extract_text_from_docx'),
            ('.txt', 'extract_text_from_txt'),
            ('.png', 'extract_text_from_image'),
            ('.jpg', 'extract_text_from_image'),
            ('.jpeg', 'extract_text_from_image'),
        ]

        for ext, function_name in test_cases:
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
                temp_path = f.name

            try:
                with patch(f'student_applications.utils.{function_name}') as mock_func:
                    mock_func.return_value = f'Text from {ext}'
                    text = extract_text_from_file(temp_path)
                    assert text == f'Text from {ext}'
                    assert mock_func.called
            finally:
                os.unlink(temp_path)

    def test_extract_text_from_file_by_content_type(self):
        """Test extract_text_from_file routing by content type"""
        from student_applications.utils import extract_text_from_file

        test_cases = [
            ('application/pdf', 'extract_text_from_pdf'),
            ('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'extract_text_from_docx'),
            ('text/plain', 'extract_text_from_txt'),
            ('image/png', 'extract_text_from_image'),
        ]

        for content_type, function_name in test_cases:
            with tempfile.NamedTemporaryFile(suffix='.unknown', delete=False) as f:
                temp_path = f.name

            try:
                with patch(f'student_applications.utils.{function_name}') as mock_func:
                    mock_func.return_value = f'Text from {content_type}'
                    text = extract_text_from_file(temp_path, content_type)
                    assert text == f'Text from {content_type}'
                    assert mock_func.called
            finally:
                os.unlink(temp_path)

    def test_extract_text_from_file_fallback(self):
        """Test extract_text_from_file fallback to text extraction"""
        from student_applications.utils import extract_text_from_file

        with tempfile.NamedTemporaryFile(suffix='.unknown', delete=False) as f:
            temp_path = f.name

        try:
            with patch('student_applications.utils.extract_text_from_txt') as mock_func:
                mock_func.return_value = 'Fallback text'
                text = extract_text_from_file(temp_path, 'unknown/type')
                assert text == 'Fallback text'
                assert mock_func.called
        finally:
            os.unlink(temp_path)