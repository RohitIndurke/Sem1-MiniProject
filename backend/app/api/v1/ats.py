from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from app.db.database import get_db
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

    # 5. Persist submission and analysis results to MongoDB Atlas
    inserted_id = None
    try:
        db = get_db()
        doc = {
            "filename": filename,
            "file_size": len(contents),
            "jd": jd,
            "resume_text_preview": resume_text[:400],
            "analysis": analysis,
            "created_at": datetime.now(timezone.utc),
        }
        result = await db["submissions"].insert_one(doc)
        inserted_id = str(result.inserted_id)
    except Exception as e:
        print(f"⚠️ MongoDB insert warning: {e}")

    return {
        "status": "success",
        "id": inserted_id,
        "filename": filename,
        "analysis": analysis,
        "message": f"Resume analyzed successfully! Score: {analysis['score']}% ({analysis['match_level']})",
    }


@router.get("/submissions")
async def get_all_submissions(
    limit: int = Query(10, ge=1, le=50),
    skip: int = Query(0, ge=0),
):
    """
    List past resume evaluations stored in MongoDB Atlas, newest first.
    """
    db = get_db()
    cursor = db["submissions"].find().sort("created_at", -1).skip(skip).limit(limit)
    submissions = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        submissions.append(doc)

    total = await db["submissions"].count_documents({})
    return {
        "total": total,
        "limit": limit,
        "skip": skip,
        "submissions": submissions,
    }


@router.get("/submissions/{submission_id}")
async def get_submission_by_id(submission_id: str):
    """
    Retrieve a specific evaluation result by its MongoDB document ID.
    """
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission ID format")

    db = get_db()
    doc = await db["submissions"].find_one({"_id": ObjectId(submission_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Submission not found")

    doc["id"] = str(doc.pop("_id"))
    return doc
