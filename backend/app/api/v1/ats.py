from fastapi import APIRouter, UploadFile, File, Form, HTTPException

router = APIRouter()

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    jd: str = Form(...),
):
   
    if file.content_type != "application/pdf" and not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()

    print(f"Received file: {file.filename!r}  size: {len(contents)} bytes")
    print(f"JD preview: {jd[:120]}")

    return {
        "status": "success",
        "filename": file.filename,
        "file_size": len(contents),
        "jd_length": len(jd),
        "message": "File and JD received successfully",
    }