from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.db.database import get_db

router = APIRouter()


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    jd: str = Form(...),
):
    # Validate PDF
    if file.content_type != "application/pdf" and not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()

    print(f"Received file: {file.filename!r}  size: {len(contents)} bytes")
    print(f"JD preview: {jd[:120]}")

    # Save submission to MongoDB
    db = get_db()
    doc = {
        "filename": file.filename,
        "file_size": len(contents),
        "jd": jd,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db["submissions"].insert_one(doc)

    return {
        "status": "success",
        "id": str(result.inserted_id),   # MongoDB ObjectId as string
        "filename": file.filename,
        "file_size": len(contents),
        "jd_length": len(jd),
        "message": "File and JD received and saved successfully",
    }