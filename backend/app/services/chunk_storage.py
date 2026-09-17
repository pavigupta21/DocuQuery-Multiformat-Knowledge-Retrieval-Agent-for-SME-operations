from sqlalchemy.orm import Session

from app.models import Document, DocumentChunk
from app.services.document_processing import process_pdf


def process_and_store_pdf(
    db: Session,
    document: Document,
    file_bytes: bytes,
) -> int:
    document.status = "processing"
    db.commit()

    chunks = process_pdf(file_bytes)

    if not chunks:
        document.status = "failed"
        db.commit()
        return 0

    for index, chunk in enumerate(chunks):
        document_chunk = DocumentChunk(
            document_id=document.id,
            chunk_index=index,
            content=chunk,
        )

        db.add(document_chunk)

    document.status = "processed"
    db.commit()

    return len(chunks)