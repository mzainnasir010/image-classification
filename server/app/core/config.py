from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Scene Classifier API"
    app_version: str = "1.0.0"
    models_dir: Path = ROOT_DIR / "models"
    cors_origins: list[str] = ["http://localhost:5174", "http://localhost:3000"]
    max_upload_mb: int = 10
    allowed_content_types: tuple[str, ...] = ("image/jpeg", "image/png", "image/webp")


settings = Settings()
