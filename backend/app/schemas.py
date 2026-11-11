from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Kind = Literal['blog', 'linkedin', 'instagram', 'twitter', 'facebook', 'threads', 'seo', 'image']


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)


class Register(StrictModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

    @field_validator('password')
    @classmethod
    def password_strength(cls, value):
        if not any(c.isalpha() for c in value) or not any(c.isdigit() for c in value):
            raise ValueError('Use at least 12 characters including a letter and number.')
        return value


class Login(StrictModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProfileUpdate(StrictModel):
    name: str = Field(min_length=2, max_length=80)


class UserSettings(StrictModel):
    default_tone: str = Field(default='Professional', max_length=60)
    default_language: str = Field(default='English', max_length=60)
    brand_context: str = Field(default='', max_length=2000)


class GenerateInput(StrictModel):
    topic: str = Field(min_length=3, max_length=3000)
    audience: str = Field(default='General audience', max_length=200)
    tone: str = Field(default='Professional', max_length=60)
    language: str = Field(default='English', max_length=60)
    word_count: int = Field(default=500, ge=30, le=2500)
    keywords: str = Field(default='', max_length=500)
    instructions: str = Field(default='', max_length=3000)
    brand_context: str = Field(default='', max_length=2000)
    industry: str = Field(default='', max_length=200)
    style: str = Field(default='Editorial illustration', max_length=100)
    aspect_ratio: Literal['1:1', '16:9', '9:16', '4:3', '3:4'] = '16:9'


class GeneratedText(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    text: str = Field(min_length=1, max_length=50000)
    seo_title: str = Field(default='', max_length=200)
    meta_description: str = Field(default='', max_length=500)
    suggestions: list[str] = Field(default_factory=list, max_length=15)


class ContentCreate(StrictModel):
    kind: Kind
    title: str = Field(min_length=1, max_length=300)
    text: str = Field(default='', max_length=50000)
    seo_title: str = Field(default='', max_length=200)
    meta_description: str = Field(default='', max_length=500)
    suggestions: list[str] = Field(default_factory=list, max_length=15)


class ContentUpdate(StrictModel):
    title: str = Field(min_length=1, max_length=300)
    text: str = Field(default='', max_length=50000)
    seo_title: str = Field(default='', max_length=200)
    meta_description: str = Field(default='', max_length=500)
    image_id: str | None = Field(default=None, pattern=r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    sound_effect: Literal['none','chime','pop','whoosh'] = 'none'


class PublicUser(BaseModel):
    id: str
    name: str
    email: str
    created_at: str
