import pandas as pd
from pathlib import Path
DATA_DIR = Path(__file__).resolve().parents[2] / "data"

def load_csv(filename:str)->pd.DataFrame:
    file_path = DATA_DIR / filename

    if not file_path.exists():
        raise FileNotFoundError("CSV not found",file_path)
    return pd.read_csv(file_path)
def load_all_data():
    return{
        "cv":load_csv("cv.csv"),
        "jobs":load_csv("job.csv"),
        "matches":load_csv("matches.csv")
    }