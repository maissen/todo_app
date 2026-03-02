import boto3
import os
from botocore.exceptions import ClientError
from typing import Optional
import uuid
from datetime import datetime, timedelta

# Initialize S3 client using IAM role (no explicit credentials needed)
s3_client = boto3.client('s3')

def generate_presigned_upload_url(bucket_name: str, object_key: str, content_type: str = None, expiration: int = 3600) -> str:
    """
    Generate a pre-signed URL for uploading a file to S3.
    
    Args:
        bucket_name: Name of the S3 bucket
        object_key: S3 object key (path) where file will be stored
        content_type: MIME type of the file (optional)
        expiration: Time in seconds for the URL to remain valid (default: 1 hour)
    
    Returns:
        str: Pre-signed URL for uploading the file
    """
    try:
        params = {
            'Bucket': bucket_name,
            'Key': object_key,
        }
        
        if content_type:
            params['ContentType'] = content_type
            
        # Generate the pre-signed URL for PUT request
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params=params,
            ExpiresIn=expiration
        )
        
        return upload_url
        
    except ClientError as e:
        print(f"Error generating pre-signed upload URL: {e}")
        raise Exception(f"Pre-signed URL generation failed: {str(e)}")


def generate_presigned_get_url(bucket_name: str, object_key: str, expiration: int = 3600) -> str:
    """
    Generate a pre-signed URL for retrieving a file from S3.
    
    Args:
        bucket_name: Name of the S3 bucket
        object_key: S3 object key (path) of the file to retrieve
        expiration: Time in seconds for the URL to remain valid (default: 1 hour)
    
    Returns:
        str: Pre-signed URL for retrieving the file
    """
    try:
        # Generate the pre-signed URL for GET request
        get_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': object_key,
            },
            ExpiresIn=expiration
        )
        
        return get_url
        
    except ClientError as e:
        print(f"Error generating pre-signed get URL: {e}")
        raise Exception(f"Pre-signed URL generation failed: {str(e)}")


def delete_file_from_s3(bucket_name: str, object_key: str):
    """
    Delete a file from S3 bucket.
    
    Args:
        bucket_name: Name of the S3 bucket
        object_key: S3 object key (path) of the file to delete
    """
    try:
        s3_client.delete_object(
            Bucket=bucket_name,
            Key=object_key
        )
    except ClientError as e:
        print(f"Error deleting file from S3: {e}")
        raise Exception(f"S3 deletion failed: {str(e)}")


def generate_unique_filename(original_filename: str, user_id: str, folder: str = "profiles") -> tuple[str, str]:
    """
    Generate a unique filename for S3 storage.
    
    Args:
        original_filename: Original filename from user upload
        user_id: User ID to organize files
        folder: Folder prefix (default: "profiles")
    
    Returns:
        tuple: (full_object_key, file_extension)
    """
    # Extract file extension
    _, ext = os.path.splitext(original_filename)
    ext = ext.lower()
    
    # Generate unique filename using UUID
    unique_filename = f"{uuid.uuid4()}{ext}"
    
    # Create the full object key: profiles/user_id/filename.ext
    object_key = f"{folder}/{user_id}/{unique_filename}"
    
    return object_key, ext


def is_valid_image_type(content_type: str) -> bool:
    """
    Check if the file content type is a valid image type.
    
    Args:
        content_type: MIME type of the file
    
    Returns:
        bool: True if valid image type, False otherwise
    """
    valid_types = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
    ]
    return content_type.lower() in valid_types