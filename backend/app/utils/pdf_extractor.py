import io
from pypdf import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text from raw PDF bytes using pypdf.
    Returns cleaned string with text from all pages.
    """
    if not pdf_bytes:
        return ""

    reader = PdfReader(io.BytesIO(pdf_bytes))
    page_texts: list[str] = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            page_texts.append(text.strip())

    return "\n".join(page_texts).strip()
