import asyncio
import io
import time
from pathlib import Path
from PIL import Image, UnidentifiedImageError
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import httpx
from fastapi import HTTPException


class MediaService:
    def __init__(self, settings):
        self.settings = settings
        if settings.cloudinary_ready:
            cloudinary.config(cloud_name=settings.cloudinary_cloud_name, api_key=settings.cloudinary_api_key, api_secret=settings.cloudinary_api_secret, secure=True)
        Path(settings.media_directory).mkdir(parents=True, exist_ok=True)

    def validate(self, data):
        if len(data) > self.settings.max_image_bytes:
            raise HTTPException(413, 'Images must be smaller than 8 MB.')
        try:
            image = Image.open(io.BytesIO(data))
            if image.format not in ('PNG', 'JPEG', 'WEBP') or image.width * image.height > 25_000_000:
                raise ValueError()
            image.verify()
            return {'PNG': ('image/png', 'png'), 'JPEG': ('image/jpeg', 'jpg'), 'WEBP': ('image/webp', 'webp')}[image.format]
        except (UnidentifiedImageError, ValueError, OSError, Image.DecompressionBombError) as exc:
            raise HTTPException(415, 'The provider returned an unsupported or invalid image.') from exc

    async def save(self, data, user_id, content_id):
        mime, extension = await asyncio.to_thread(self.validate, data)
        if self.settings.cloudinary_ready:
            try:
                result = await asyncio.to_thread(cloudinary.uploader.upload, data, public_id=f'ai-content-studio/{user_id}/{content_id}', resource_type='image', type='authenticated', overwrite=False)
                return {'provider': 'cloudinary', 'public_id': result['public_id'], 'format': result['format'], 'mime': mime}
            except Exception as exc:
                raise HTTPException(502, 'The image was generated but storage is unavailable. Check media-service configuration.') from exc
        if self.settings.environment == 'production':
            raise HTTPException(503, 'Configure Cloudinary before generating images in production.')
        filename = f'{content_id}.{extension}'
        await asyncio.to_thread((Path(self.settings.media_directory) / filename).write_bytes, data)
        return {'provider': 'local', 'filename': filename, 'mime': mime}

    async def read(self, media):
        if media['provider'] == 'local':
            path = (Path(self.settings.media_directory) / media['filename']).resolve()
            if not path.is_relative_to(Path(self.settings.media_directory).resolve()) or not path.exists():
                raise HTTPException(404, 'Image not found.')
            return await asyncio.to_thread(path.read_bytes)
        url = cloudinary.utils.private_download_url(media['public_id'], media['format'], type='authenticated', expires_at=int(time.time()) + 60)
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(url)
                response.raise_for_status()
                if len(response.content) > self.settings.max_image_bytes:
                    raise ValueError()
                return response.content
        except Exception as exc:
            raise HTTPException(502, 'Image storage is temporarily unavailable.') from exc

    async def delete(self, media):
        if media['provider'] == 'cloudinary':
            result = await asyncio.to_thread(cloudinary.uploader.destroy, media['public_id'], type='authenticated', invalidate=True)
            if result.get('result') not in ('ok', 'not found'):
                raise HTTPException(502, 'Image deletion failed. Please try again.')
        else:
            path = (Path(self.settings.media_directory) / media['filename']).resolve()
            if path.is_relative_to(Path(self.settings.media_directory).resolve()):
                await asyncio.to_thread(path.unlink, missing_ok=True)
