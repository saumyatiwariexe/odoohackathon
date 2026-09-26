import json
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA_DIR = Path("data") / "users"
USERS_FILE = DATA_DIR / "users.json"

# In production, load this from environment variables
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

def login(email: str, password: str):
    email = email.strip().lower()
    users = _load_users()

    # Spec: Generic error to prevent account enumeration
    if email not in users:
        return {"Status": False, "Message": "Invalid email or password", "User": None}

    user = users[email]
    stored_hash = user.get("password_hash", "")

    # Spec: bcrypt.compare(enteredPassword, storedHash)
    try:
        is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    except ValueError:
        is_valid = False

    if not is_valid:
        return {"Status": False, "Message": "Invalid email or password", "User": None}

    # Spec: Issue tokens (JWT)
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {
        "sub": user.get("id"),
        "role": user.get("role"),
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    access_token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

    return {
        "Status": True,
        "Message": "Login successful",
        "User": {
            "id": user.get("id"),
            "email": email,
            "role": user.get("role"),
            "access_token": access_token
        }
    }