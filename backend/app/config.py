from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "ats_db"

    class Config:
        env_file = ".env.local"

settings = Settings()

