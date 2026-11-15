import io
from pypdf import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from in-memory PDF bytes.
    """
    if not pdf_bytes:
        return ""

    reader = PdfReader(io.BytesIO(pdf_bytes))
    page_texts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            page_texts.append(text.strip())

    return "\n".join(page_texts).strip()

