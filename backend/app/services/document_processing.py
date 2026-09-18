from app.services.pdf_extractor import extract_text_from_pdf
from app.services.excel_extractor import extract_text_from_excel
from app.services.text_chunker import chunk_text
from app.services.text_extractor import extract_text_from_txt
from app.services.email_extractor import extract_text_from_eml


def process_pdf(file_bytes: bytes) -> list[str]:
    extracted_text = extract_text_from_pdf(file_bytes)

    if not extracted_text:
        return []

    return chunk_text(extracted_text)


def process_excel(file_bytes: bytes) -> list[str]:
    extracted_text = extract_text_from_excel(file_bytes)

    if not extracted_text:
        return []

    return chunk_text(extracted_text)

def process_txt(file_bytes: bytes) -> list[str]:
    extracted_text = extract_text_from_txt(file_bytes)

    if not extracted_text:
        return []

    return chunk_text(extracted_text)

def process_eml(file_bytes: bytes) -> list[str]:
    extracted_text = extract_text_from_eml(file_bytes)

    if not extracted_text:
        return []

    return chunk_text(extracted_text)