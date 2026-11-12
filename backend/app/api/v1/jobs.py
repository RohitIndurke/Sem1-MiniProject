from fastapi import APIRouter,Query,HTTPException
from app.data.cache import DATA

router = APIRouter()

@router.get("/")
def get_jobs(
    category: str | None = None,
    title: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    df = DATA["jobs"]

    if df is None:
        raise HTTPException(503, "Jobs dataset is not loaded")
    filtered = df.copy()

    if category:
        filtered = filtered[
            filtered["category"].astype(str).str.contains(
                category, case=False, na=False, regex=False
            )
        ]

    if title:
        filtered = filtered[
            filtered["job_title"].astype(str).str.contains(
                title, case=False, na=False, regex=False
            )
        ]
    total  = len(filtered)

    start = (page-1)*limit
    end = start + limit

    result = filtered.iloc[start:end]

    records = (
        result.astype(object)
        .where(result.notna(),None)
        .to_dict(orient="records")
    )

    return{
        "total":total,
        "page":page,
        "limit":limit,
        "jobs":records
    }