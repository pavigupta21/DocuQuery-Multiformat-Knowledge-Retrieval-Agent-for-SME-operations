import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")


def send_verification_otp(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit email verification OTP via Gmail SMTP.
    If SMTP credentials are not yet configured in .env, prints OTP to console for local testing.
    """
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"\n[DEV MODE] Gmail SMTP credentials not set in .env")
        print(f"[DEV MODE] Verification OTP for {to_email} is: {otp_code}\n")
        return True

    try:
        msg = MIMEMultipart()
        msg["From"] = f"DocuQuery Assistant <{SMTP_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = f"{otp_code} is your DocuQuery Verification Code"

        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 30px;">
            <div style="max-width: 500px; margin: 0 auto; background: #121826; border: 1px solid #6366f1; border-radius: 12px; padding: 25px; text-align: center;">
              <h2 style="color: #6366f1; margin-bottom: 10px;">DocuQuery Account Verification</h2>
              <p style="color: #94a3b8; font-size: 14px;">Use the 6-digit code below to verify your work email address and complete registration:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #10b981; background: rgba(16,185,129,0.1); border: 1px dashed #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
                {otp_code}
              </div>
              <p style="color: #64748b; font-size: 12px;">If you did not request this verification code, please ignore this email.</p>
            </div>
          </body>
        </html>
        """

        msg.attach(MIMEText(body, "html"))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"\n[SMTP ERROR] Failed to send email via Gmail SMTP: {e}")
        print(f"[FALLBACK OTP] Verification code for {to_email} is: {otp_code}\n")
        return False
