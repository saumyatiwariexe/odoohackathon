import json
import bcrypt
import jwt
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA_DIR = Path("data") / "users"
USERS_FILE = DATA_DIR / "users.json"

JWT_SECRET = "admin"
ALGORITHM = "HS256"

def _load_users():
    if not USERS_FILE.exists():
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_users(data: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def signup(email: str, password: str, name: str = "New User", role: str = "warehouse_staff"):
    email = email.strip().lower()
    
    # Spec: Enforce a minimum password policy
    if len(password) < 8 or not any(c.isupper() for c in password) or not any(c.isdigit() for c in password):
        return {
            "Status": False, 
            "Message": "Password must be >= 8 chars, mixed case, 1 number", 
            "User": None
        }

    users = _load_users()

    # Spec: Uniqueness check
    if email in users:
        return {"Status": False, "Message": "Email already registered", "User": None}

    # Spec: bcrypt hash with cost factor 12
    salt = bcrypt.gensalt(rounds=12)
    password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    # Spec: Insert users row (to JSON here)
    user_id = str(uuid.uuid4())
    users[email] = {
        "id": user_id,
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    _save_users(users)

    # Spec: Issue tokens
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    access_token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

    return {
        "Status": True,
        "Message": "Account created successfully",
        "User": {
            "id": user_id,
            "email": email,
            "role": role,
            "access_token": access_token
        }
    }