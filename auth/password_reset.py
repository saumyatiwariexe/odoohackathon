import os
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import HTTPException
import random
import smtplib
from email.message import EmailMessage

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from environment variables")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def send_otp_email(email: str, otp: str):
    # SMTP config
    smtp_host = os.getenv("SMTP_HOST", "localhost")
    smtp_port = int(os.getenv("SMTP_PORT", "1025"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    sender_email = os.getenv("SMTP_SENDER", "noreply@stocksense.com")
    
    msg = EmailMessage()
    msg.set_content(f"Your password reset OTP is: {otp}")
    msg['Subject'] = 'Password Reset OTP'
    msg['From'] = sender_email
    msg['To'] = email

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                if smtp_user and smtp_password:
                    server.login(smtp_user, smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                if smtp_user and smtp_password:
                    server.starttls()
                    server.login(smtp_user, smtp_password)
                server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")

def forgot_password(email: str):
    email = email.strip().lower()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Check if user exists
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            
            # Don't throw error if user not found to prevent enumeration
            if user:
                # Generate 6 digit OTP
                otp = f"{random.randint(0, 999999):06d}"
                # Hash OTP with cost factor 10
                otp_hash = bcrypt.hashpw(otp.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
                
                # Expiry 10 minutes
                expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
                
                cur.execute("""
                    INSERT INTO password_resets (user_id, otp_hash, expires_at)
                    VALUES (%s, %s, %s)
                """, (user['id'], otp_hash, expires_at))
                
                # Send email
                send_otp_email(email, otp)
                
            conn.commit()
    finally:
        conn.close()
        
    return {"message": "If that email exists, an OTP has been sent."}

def reset_password(email: str, otp: str, new_password: str):
    email = email.strip().lower()
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT pr.id, pr.otp_hash, pr.user_id
                FROM password_resets pr
                JOIN users u ON u.id = pr.user_id
                WHERE u.email = %s AND pr.used = false AND pr.expires_at > now()
                ORDER BY pr.created_at DESC
                LIMIT 1
            """, (email,))
            
            reset_row = cur.fetchone()
            
            if not reset_row:
                raise HTTPException(status_code=400, detail="Invalid or expired OTP")
                
            # Verify OTP
            try:
                is_valid = bcrypt.checkpw(otp.encode('utf-8'), reset_row['otp_hash'].encode('utf-8'))
            except ValueError:
                is_valid = False
                
            if not is_valid:
                raise HTTPException(status_code=400, detail="Invalid or expired OTP")
                
            # Validate new password strength
            # >= 8 chars, mixed case, 1 number
            if (len(new_password) < 8 or 
                not any(c.isupper() for c in new_password) or 
                not any(c.islower() for c in new_password) or 
                not any(c.isdigit() for c in new_password)):
                raise HTTPException(
                    status_code=400, 
                    detail="Password must be at least 8 characters long and contain uppercase, lowercase, and a number."
                )
                
            # Hash new password
            new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
            
            # Update password
            cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_password_hash, reset_row['user_id']))
            
            # Invalidate all outstanding reset rows
            cur.execute("UPDATE password_resets SET used = true WHERE user_id = %s", (reset_row['user_id'],))
            
            conn.commit()
            
    finally:
        conn.close()
        
    return {"message": "Password successfully reset"}
