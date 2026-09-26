import os
import bcrypt
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import HTTPException
import re

load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
DATABASE_URL = os.getenv("DATABASE_URL")

if not JWT_SECRET or not DATABASE_URL:
    raise ValueError("Missing environment variables")

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def signup(email: str, password: str, full_name: str, role: str):
    email = email.strip().lower()
    full_name = full_name.strip()
    
    # Validation
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise HTTPException(status_code=400, detail="Invalid email format")
        
    if len(full_name) < 2 or len(full_name) > 100:
        raise HTTPException(status_code=400, detail="Name must be between 2 and 100 characters")
        
    if role not in ["manager", "staff"]:
        raise HTTPException(status_code=400, detail="Role must be manager or staff")
        
    # Strict password policy
    if len(password) < 8 or not any(c.isupper() for c in password) or not any(c.isdigit() for c in password) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must be >= 8 chars, 1 uppercase, 1 number, 1 special character")

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Uniqueness check
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                raise HTTPException(status_code=409, detail="Email already registered")
                
            # Hash password
            salt = bcrypt.gensalt(rounds=12)
            password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
            
            # Insert
            cur.execute("""
                INSERT INTO users (email, full_name, password_hash, role)
                VALUES (%s, %s, %s, %s)
                RETURNING id, email, role
            """, (email, full_name, password_hash, role))
            
            new_user = cur.fetchone()
            conn.commit()
            
            # Issue tokens
            expire_minutes = int(os.getenv("JWT_ACCESS_EXPIRE_MINUTES", "1440"))
            expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
            payload = {
                "sub": str(new_user["id"]),
                "role": new_user["role"],
                "exp": expire,
                "iat": datetime.now(timezone.utc)
            }
            access_token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
            
            return {
                "message": "Account created successfully",
                "user": {
                    "id": str(new_user["id"]),
                    "email": new_user["email"],
                    "role": new_user["role"]
                },
                "access_token": access_token
            }
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()