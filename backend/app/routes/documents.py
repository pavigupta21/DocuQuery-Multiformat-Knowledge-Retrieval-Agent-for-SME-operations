import uuid

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, Document, DocumentChunk
from app.services.document_storage import upload_file_to_r2
from app.services.chunk_storage import process_and_store_pdf
from app.schemas import DocumentResponse
from app.services.document_processing import (
    process_pdf,
    process_excel,
    process_txt,
    process_eml
)
from app.services.document_storage import (
    upload_file_to_r2,
    delete_file_from_r2,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    file_bytes = await file.read()

    object_key = (
        f"users/{current_user.id}/"
        f"{uuid.uuid4()}_{file.filename}"
    )

    upload_file_to_r2(
        file_bytes=file_bytes,
        object_key=object_key,
        content_type=file.content_type or "application/octet-stream",
    )

    document = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_type=file.content_type or "unknown",
        file_path=object_key,
        status="uploaded",
    )

    db.add(document)
    db.commit()
    db.refresh(document)
    chunk_count = 0

   
    chunk_count = 0

    if file.content_type == "application/pdf":
        chunks = process_pdf(file_bytes)

    elif file.content_type in [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ]:
        chunks = process_excel(file_bytes)

    elif file.content_type == "text/plain":
        chunks = process_txt(file_bytes)

    elif file.content_type == "message/rfc822":
        chunks = process_eml(file_bytes)

    else:
        chunks = []

    for index, chunk in enumerate(chunks):
        document_chunk = DocumentChunk(
            document_id=document.id,
            chunk_index=index,
            content=chunk,
        )
        db.add(document_chunk)

    chunk_count = len(chunks)

    document.status = "processed" if chunks else "uploaded"
    db.commit()

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "filename": document.filename,
        "status": document.status,
        "chunk_count":chunk_count
    }

@router.get("/", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )

    return documents

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    delete_file_from_r2(document.file_path)

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully",
        "document_id": document_id,
    }
