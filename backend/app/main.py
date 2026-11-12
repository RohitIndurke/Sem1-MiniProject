from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.data.loder import load_all_data
from app.data.cache import DATA

from app.api.v1 import ats, jobs, candidates, resume

app = FastAPI(
    title="ATS Resume Generator API",
    description="Backend for ATS Resume Generator",
    version="1.0.0"
)

# Allow frontend requests
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    loaded_data = load_all_data()
    DATA.update(loaded_data)
    print("All CSV datasets loaded successfully!")


@app.get("/")
def home():
    return {
  "message": "ATS Resume Generator API is running",
  "pune": {
    "temperature": 36,
    "unit": "°C"
  },
  "mumbai": {
    "west": {
      "temperature": 39,
      "unit": "°C"
    },
    "east": {
      "temperature": 11,
      "unit": "°C"
    }
  }
}


app.include_router(
    ats.router,
    prefix="/api/v1/ats",
    tags=["ATS"]
)

app.include_router(
    jobs.router,
    prefix="/api/v1/jobs",
    tags=["Jobs"]
)

app.include_router(
    candidates.router,
    prefix="/api/v1/candidates",
    tags=["Candidates"]
)

app.include_router(
    resume.router,
    prefix="/api/v1/resume",
    tags=["Resume"]
)   