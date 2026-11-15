from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        validation_alias=AliasChoices("MONGODB_URI", "MONGO_URI"),
    )
    MONGODB_DB_NAME: str = Field(
        default="ats_db",
        validation_alias=AliasChoices("MONGODB_DB_NAME", "MONGO_DB_NAME"),
    )
    MONGODB_USERNAME: str | None = None
    MONGODB_PASSWORD: str | None = None

    # Properties for backward compatibility with code using either naming
    @property
    def MONGO_URI(self) -> str:
        return self.MONGODB_URI

    @property
    def MONGO_DB_NAME(self) -> str:
        return self.MONGODB_DB_NAME

settings = Settings()
