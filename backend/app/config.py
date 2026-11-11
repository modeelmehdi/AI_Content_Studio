from pathlib import Path
from functools import lru_cache
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND / '.env', extra='ignore')
    environment: str = 'development'
    database_backend: str = 'sqlite'
    sqlite_path: str = str(BACKEND / 'data/studio.sqlite3')
    mongodb_uri: str = ''
    mongodb_database: str = 'ai_content_studio'
    jwt_secret: str = Field(default='', repr=False)
    allowed_origins: str = 'http://127.0.0.1:5175,http://localhost:5175,http://127.0.0.1:8000'
    secure_cookies: bool = False
    access_minutes: int = 15
    refresh_days: int = 7
    gemini_api_key: str = Field(default='', repr=False)
    gemini_text_model: str = ''
    gemini_image_model: str = ''
    image_provider: str = 'cloudflare'
    cloudflare_account_id: str = ''
    cloudflare_api_token: str = Field(default='', repr=False)
    media_storage: str = 'local'
    ai_timeout_seconds: int = 90
    cloudinary_cloud_name: str = ''
    cloudinary_api_key: str = Field(default='', repr=False)
    cloudinary_api_secret: str = Field(default='', repr=False)
    media_directory: str = str(BACKEND / 'data/media')
    max_image_bytes: int = 8_000_000

    @property
    def origins(self):
        return [v.strip().rstrip('/') for v in self.allowed_origins.split(',') if v.strip()]

    @property
    def cloudinary_ready(self):
        return all([self.cloudinary_cloud_name, self.cloudinary_api_key, self.cloudinary_api_secret])

    @property
    def image_ready(self):
        provider = bool(self.cloudflare_account_id and self.cloudflare_api_token) if self.image_provider == 'cloudflare' else bool(self.gemini_api_key and self.gemini_image_model)
        storage = self.cloudinary_ready or self.media_storage == 'mongodb' or self.environment != 'production'
        return provider and storage

    @model_validator(mode='after')
    def validate_config(self):
        if len(self.jwt_secret) < 32:
            raise ValueError('Set JWT_SECRET to a random secret of at least 32 characters in backend/.env.')
        if self.database_backend not in ('sqlite', 'mongodb'):
            raise ValueError('DATABASE_BACKEND must be sqlite or mongodb.')
        if self.image_provider not in ('cloudflare', 'gemini'):
            raise ValueError('IMAGE_PROVIDER must be cloudflare or gemini.')
        if self.media_storage not in ('local', 'mongodb'):
            raise ValueError('MEDIA_STORAGE must be local or mongodb.')
        if self.media_storage == 'mongodb' and self.database_backend != 'mongodb':
            raise ValueError('MongoDB image storage requires MongoDB.')
        if self.database_backend == 'mongodb' and not self.mongodb_uri:
            raise ValueError('MONGODB_URI is required for MongoDB mode.')
        if self.environment == 'production':
            if self.database_backend != 'mongodb' or not self.secure_cookies:
                raise ValueError('Production requires MongoDB and SECURE_COOKIES=true.')
            if any(not o.startswith('https://') for o in self.origins):
                raise ValueError('Production origins must use HTTPS.')
        return self


@lru_cache
def get_settings():
    return Settings()
