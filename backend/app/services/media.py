import asyncio
import io
import time
import base64
from pathlib import Path
from PIL import Image, UnidentifiedImageError
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import httpx
from fastapi import HTTPException


class MediaService:
    def __init__(self, settings, store=None):
        self.settings = settings
        self.store = store
        if settings.cloudinary_ready:
            cloudinary.config(cloud_name=settings.cloudinary_cloud_name, api_key=settings.cloudinary_api_key, api_secret=settings.cloudinary_api_secret, secure=True)
        if settings.media_storage == 'local' and not settings.cloudinary_ready and settings.environment != 'production':
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

    async def save(self, data, user_id, content_id, aspect_ratio=None):
        mime, extension = await asyncio.to_thread(self.validate, data)
        if self.settings.media_storage == 'mongodb':
            if not self.store:
                raise HTTPException(503, 'Image database is unavailable.')
            if await self.store.count('image_files', {}) >= 100:
                raise HTTPException(507, 'The free image library is full. Delete unused images before creating more.')
            def compact():
                from PIL import ImageOps
                image = Image.open(io.BytesIO(data)).convert('RGB')
                if aspect_ratio:
                    width, height = map(int, aspect_ratio.split(':'))
                    scale = 1024 / max(width, height)
                    image = ImageOps.fit(image, (round(width * scale), round(height * scale)), method=Image.Resampling.LANCZOS)
                else:
                    image.thumbnail((1024, 1024))
                stream = io.BytesIO()
                image.save(stream, 'JPEG', quality=80, optimize=True)
                return stream.getvalue()
            compacted = await asyncio.to_thread(compact)
            if len(compacted) > 600_000:
                raise HTTPException(413, 'This image exceeds the free storage limit. Try a simpler image.')
            await self.store.insert('image_files', {'id': content_id, 'user_id': user_id, 'data': base64.b64encode(compacted).decode('ascii')})
            return {'provider': 'mongodb', 'id': content_id, 'user_id': user_id, 'mime': 'image/jpeg'}
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
        if media['provider'] == 'mongodb':
            image = await self.store.one('image_files', {'id': media['id'], 'user_id': media['user_id']})
            if not image:
                raise HTTPException(404, 'Image not found.')
            return base64.b64decode(image['data'])
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
        if media['provider'] == 'mongodb':
            await self.store.delete('image_files', {'id': media['id'], 'user_id': media['user_id']})
        elif media['provider'] == 'cloudinary':
            result = await asyncio.to_thread(cloudinary.uploader.destroy, media['public_id'], type='authenticated', invalidate=True)
            if result.get('result') not in ('ok', 'not found'):
                raise HTTPException(502, 'Image deletion failed. Please try again.')
        else:
            path = (Path(self.settings.media_directory) / media['filename']).resolve()
            if path.is_relative_to(Path(self.settings.media_directory).resolve()):
                await asyncio.to_thread(path.unlink, missing_ok=True)
