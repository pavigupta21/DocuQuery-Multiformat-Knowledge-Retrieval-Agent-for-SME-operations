from app.storage import r2_client, R2_BUCKET_NAME


def upload_file_to_r2(file_bytes: bytes, object_key: str, content_type: str):
    r2_client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=object_key,
        Body=file_bytes,
        ContentType=content_type,
    )

    return object_key

def delete_file_from_r2(object_key: str):
    r2_client.delete_object(
        Bucket=R2_BUCKET_NAME,
        Key=object_key,
    )