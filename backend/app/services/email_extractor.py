from io import BytesIO
from email import policy
from email.parser import BytesParser


def extract_text_from_eml(file_bytes: bytes) -> str:
    message = BytesParser(policy=policy.default).parse(
        BytesIO(file_bytes)
    )

    extracted_parts = []

    if message.get("subject"):
        extracted_parts.append(f"Subject: {message['subject']}")

    if message.get("from"):
        extracted_parts.append(f"From: {message['from']}")

    if message.get("to"):
        extracted_parts.append(f"To: {message['to']}")

    if message.get("cc"):
        extracted_parts.append(f"Cc: {message['cc']}")

    if message.get("date"):
        extracted_parts.append(f"Date: {message['date']}")

    extracted_parts.append("")

    if message.is_multipart():
        for part in message.walk():
            if part.get_content_type() == "text/plain":
                content = part.get_content()
                if content.strip():
                    extracted_parts.append(content.strip())
    else:
        content = message.get_content()
        if content.strip():
            extracted_parts.append(content.strip())

    return "\n".join(extracted_parts).strip()