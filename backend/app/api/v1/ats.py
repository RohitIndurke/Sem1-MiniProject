from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from app.db.database import save_submission, fetch_submissions, is_db_connected
from app.utils.pdf_extractor import extract_text_from_pdf
from app.services.ats_analyzer import analyze_resume_against_jd

router = APIRouter()

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    jd: str = Form(...),
):
    # 1. Validate file extension and MIME type
    filename = file.filename or ""
    content_type = file.content_type or ""
    if not (filename.lower().endswith(".pdf") or content_type == "application/pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # 2. Read raw PDF bytes
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # 3. Extract text from the PDF
    try:
        resume_text = extract_text_from_pdf(contents)
    except Exception as e:
        print(f"⚠️ PDF extraction error: {e}")
        raise HTTPException(status_code=422, detail=f"Failed to extract text from PDF: {str(e)}")

    if not resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from this PDF. Please ensure it is not a scanned image.",
        )

    # 4. Run ATS analysis algorithm against the Job Description
    analysis = analyze_resume_against_jd(resume_text=resume_text, jd_text=jd)

    # 5. Persist submission and analysis results (with fallback)
    doc = {
        "filename": filename,
        "file_size": len(contents),
        "jd": jd,
        "resume_text_preview": resume_text[:400],
        "analysis": analysis,
        "created_at": datetime.now(timezone.utc),
    }
    inserted_id = await save_submission(doc)

    return {
        "status": "success",
        "id": inserted_id,
        "filename": filename,
        "analysis": analysis,
        "connected_to_atlas": is_db_connected(),
        "message": f"Resume analyzed successfully! Score: {analysis['score']}% ({analysis['match_level']})",
    }


@router.get("/submissions")
async def get_all_submissions(
    limit: int = Query(10, ge=1, le=50),
    skip: int = Query(0, ge=0),
):
    items, total = await fetch_submissions(limit=limit, skip=skip)
    return {
        "total": total,
        "limit": limit,
        "skip": skip,
        "submissions": items,
        "connected_to_atlas": is_db_connected(),
    }
