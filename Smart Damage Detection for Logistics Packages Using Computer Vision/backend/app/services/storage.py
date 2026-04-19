# backend/app/services/storage.py
import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError
import uuid
from datetime import datetime

S3_BUCKET = os.getenv("S3_BUCKET_NAME")  # Changed from S3_BUCKET to S3_BUCKET_NAME
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")


def generate_s3_key(bucket_name: str, prefix: str, filename: str) -> str:
    """
    Generate a unique S3 key for file upload with clean folder structure
    
    Args:
        bucket_name: S3 bucket name (ignored for compatibility)
        prefix: Folder prefix (e.g., 'uploads', 'crops', 'annotated', 'explainability')
        filename: Original filename
    
    Returns:
        S3 key path like: uploads/2025-11-19/abc123_filename.jpg
    """
    # Extract file extension
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'jpg'
    
    # Generate simple date string (YYYY-MM-DD) instead of nested folders
    now = datetime.utcnow()
    date_str = now.strftime('%Y-%m-%d')  # Single folder: 2025-11-19
    
    # Generate unique ID
    unique_id = str(uuid.uuid4())[:8]
    
    # Clean filename (remove spaces and special chars)
    clean_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
    clean_name = ''.join(c if c.isalnum() or c in '-_' else '_' for c in clean_name)
    
    # Build clean S3 key: prefix/date/uniqueID_filename.ext
    s3_key = f"{prefix}/{date_str}/{unique_id}_{clean_name}.{ext}"
    
    return s3_key


def upload_bytes_to_s3(key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """
    Upload bytes to S3 and return the S3 URL
    
    Args:
        key: S3 object key (path)
        data: File data as bytes
        content_type: MIME type (e.g., 'image/jpeg')
    
    Returns:
        S3 URL: s3://bucket-name/key
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET_NAME not configured in environment variables")
    
    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    
    try:
        s3.put_object(
            Bucket=S3_BUCKET, 
            Key=key, 
            Body=data, 
            ContentType=content_type
        )
        
        # Return S3 URL
        s3_url = f"s3://{S3_BUCKET}/{key}"
        print(f"✅ Uploaded to S3: {s3_url}")
        
        return s3_url
        
    except (BotoCoreError, ClientError) as e:
        print(f"❌ S3 Upload Error: {e}")
        raise


def upload_file_to_s3(file_path: str, s3_key: str, content_type: str = None) -> str:
    """
    Upload a file from local path to S3
    
    Args:
        file_path: Local file path
        s3_key: S3 object key (destination path)
        content_type: MIME type (auto-detected if None)
    
    Returns:
        S3 URL: s3://bucket-name/key
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET_NAME not configured")
    
    # Auto-detect content type if not provided
    if not content_type:
        ext = file_path.rsplit('.', 1)[-1].lower()
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        content_type = content_types.get(ext, 'application/octet-stream')
    
    # Read file and upload
    with open(file_path, 'rb') as f:
        data = f.read()
    
    return upload_bytes_to_s3(s3_key, data, content_type)


def generate_presigned_url(s3_key: str, expiration: int = 3600) -> str:
    """
    Generate a presigned URL for viewing an S3 object
    
    Args:
        s3_key: S3 object key
        expiration: URL expiration time in seconds (default: 1 hour)
    
    Returns:
        Presigned URL (https://)
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET_NAME not configured")
    
    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    
    try:
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': s3_key},
            ExpiresIn=expiration
        )
        return url
    except (BotoCoreError, ClientError) as e:
        print(f"❌ Error generating presigned URL: {e}")
        raise


def delete_from_s3(s3_key: str) -> bool:
    """
    Delete an object from S3
    
    Args:
        s3_key: S3 object key to delete
    
    Returns:
        True if successful, False otherwise
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET_NAME not configured")
    
    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    
    try:
        s3.delete_object(Bucket=S3_BUCKET, Key=s3_key)
        print(f"✅ Deleted from S3: {s3_key}")
        return True
    except (BotoCoreError, ClientError) as e:
        print(f"❌ Error deleting from S3: {e}")
        return False


def download_from_s3(bucket_name: str, s3_key: str) -> bytes:
    """
    Download file from S3 and return as bytes
    
    Args:
        bucket_name: S3 bucket name
        s3_key: S3 object key
    
    Returns:
        File data as bytes
    """
    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    
    try:
        response = s3.get_object(Bucket=bucket_name, Key=s3_key)
        return response['Body'].read()
    except (BotoCoreError, ClientError) as e:
        print(f"❌ Error downloading from S3: {e}")
        raise

def list_s3_objects(prefix: str = "", max_keys: int = 1000) -> list:
    """
    List objects in S3 bucket with optional prefix
    
    Args:
        prefix: Filter by key prefix (e.g., 'uploads/')
        max_keys: Maximum number of objects to return
    
    Returns:
        List of object dictionaries with 'Key', 'Size', 'LastModified'
    """
    if not S3_BUCKET:
        raise RuntimeError("S3_BUCKET_NAME not configured")
    
    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
    
    try:
        response = s3.list_objects_v2(
            Bucket=S3_BUCKET,
            Prefix=prefix,
            MaxKeys=max_keys
        )
        
        if 'Contents' in response:
            return response['Contents']
        return []
        
    except (BotoCoreError, ClientError) as e:
        print(f"❌ Error listing S3 objects: {e}")
        return []