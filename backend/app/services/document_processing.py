from app.services.pdf_extractor import extract_text_from_pdf
from app.services.text_chunker import chunk_text


def process_pdf(file_bytes: bytes) -> list[str]:
    extracted_text = extract_text_from_pdf(file_bytes)

    if not extracted_text:
        return []

    return chunk_text(extracted_text)