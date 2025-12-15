"""
ImageKit.io integration for image upload and management.
"""
import os
from imagekitio import ImageKit
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from fastapi import UploadFile, HTTPException
import base64
from typing import Optional

# Initialize ImageKit with environment variables
def get_imagekit():
    """Get ImageKit instance with credentials from environment variables."""
    private_key = os.getenv("IMAGEKIT_PRIVATE_KEY")
    public_key = os.getenv("IMAGEKIT_PUBLIC_KEY")
    url_endpoint = os.getenv("IMAGEKIT_URL_ENDPOINT")
    
    if not all([private_key, public_key, url_endpoint]):
        raise ValueError(
            "ImageKit credentials not found. Please set IMAGEKIT_PRIVATE_KEY, "
            "IMAGEKIT_PUBLIC_KEY, and IMAGEKIT_URL_ENDPOINT in your environment variables."
        )
    
    return ImageKit(
        private_key=private_key,
        public_key=public_key,
        url_endpoint=url_endpoint
    )


async def upload_sweet_image(file: UploadFile, sweet_name: str) -> dict:
    """
    Upload a sweet image to ImageKit.
    
    Args:
        file: The uploaded file from FastAPI
        sweet_name: Name of the sweet (used for file naming)
    
    Returns:
        dict: Contains 'url' and 'file_id' from ImageKit
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Validate file size (max 5MB)
        contents = await file.read()
        file_size = len(contents)
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 5MB"
            )
        
        # Reset file pointer
        await file.seek(0)
        
        # Get ImageKit instance
        imagekit = get_imagekit()
        
        # Prepare file name (sanitize sweet name)
        safe_name = "".join(c for c in sweet_name if c.isalnum() or c in (' ', '-', '_')).strip()
        file_name = f"sweet_{safe_name}_{file.filename}"
        
        # Convert file to base64
        file_base64 = base64.b64encode(contents).decode('utf-8')
        
        # Create upload options
        upload_options = UploadFileRequestOptions(
            folder="/sweets/",
            use_unique_file_name=True
        )
        
        # Upload to ImageKit
        result = imagekit.upload(
            file=file_base64,
            file_name=file_name,
            options=upload_options
        )
        
        if result and hasattr(result, 'url') and hasattr(result, 'file_id'):
            return {
                "url": result.url,
                "file_id": result.file_id,
                "thumbnail_url": result.thumbnail_url if hasattr(result, 'thumbnail_url') else result.url
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload image to ImageKit"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading image: {str(e)}"
        )


def delete_sweet_image(file_id: str) -> bool:
    """
    Delete an image from ImageKit.
    
    Args:
        file_id: The ImageKit file ID to delete
    
    Returns:
        bool: True if successful
    """
    try:
        imagekit = get_imagekit()
        result = imagekit.delete_file(file_id)
        return True
    except Exception as e:
        print(f"Error deleting image from ImageKit: {str(e)}")
        return False


def get_image_url(file_id: str, transformations: Optional[dict] = None) -> str:
    """
    Get URL for an image with optional transformations.
    
    Args:
        file_id: The ImageKit file ID
        transformations: Optional dict of ImageKit transformations
    
    Returns:
        str: The image URL
    """
    try:
        imagekit = get_imagekit()
        url_endpoint = os.getenv("IMAGEKIT_URL_ENDPOINT")
        
        # Basic URL construction
        if transformations:
            # Apply transformations (e.g., resize, quality)
            # This is simplified - adjust based on your needs
            return f"{url_endpoint}/tr:{','.join([f'{k}-{v}' for k, v in transformations.items()])}/{file_id}"
        else:
            return f"{url_endpoint}/{file_id}"
    except Exception as e:
        print(f"Error getting image URL: {str(e)}")
        return ""
