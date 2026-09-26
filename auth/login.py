import os
import bcrypt
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import HTTPException

# Load environment variables
load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
DATABASE_URL = os.getenv("DATABASE_URL")

if not JWT_SECRET:
    raise ValueError("JWT_SECRET is missing from environment variables")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is missing from environment variables")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def login(email: str, password: str):
    email = email.strip().lower()
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, email, password_hash, role FROM users WHERE email = %s", (email,))
            user = cur.fetchone()
            
        if not user:
            # Generic error to prevent enumeration
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        stored_hash = user["password_hash"]
        
        # Verify password
        try:
            is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        except ValueError:
            is_valid = False
            
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")
            
        # Issue token
        expire_minutes = int(os.getenv("JWT_ACCESS_EXPIRE_MINUTES", "1440"))
        expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
        payload = {
            "sub": str(user["id"]),
            "role": user["role"],
            "exp": expire,
            "iat": datetime.now(timezone.utc)
        }
        access_token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
        
        return {
            "message": "Login successful",
            "user": {
                "id": str(user["id"]),
                "email": user["email"],
                "role": user["role"]
            },
            "access_token": access_token
        }
    finally:
        conn.close()