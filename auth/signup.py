import json
import hashlib
from pathlib import Path

DATA_DIR = Path("data") / "users"
USERS_FILE = DATA_DIR / "users.json"
PENDING_FILE = DATA_DIR / "pending.json"


def _generate_fibonacci(n: int) -> int:
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b


def password_funct(password: str, base_step: int = 5):
    seed_index = (len(password) % 10) + base_step
    rounds = _generate_fibonacci(seed_index)
    fib_check = (rounds * len(password)) % 997

    curr_hash = password.encode("utf-8")
    for _ in range(rounds):
        curr_hash = hashlib.sha256(curr_hash + str(fib_check).encode()).digest()

    return rounds, fib_check, hashlib.sha256(curr_hash).hexdigest()


def _load_json(file_path: Path) -> dict:
    if not file_path.exists():
        return {}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_json(file_path: Path, data: dict) -> bool:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
        return True
    except Exception:
        return False


def signup(username: str = "", password: str = "", role: str = "staff", assigned_warehouse: str = "Main Warehouse"):
    username = username.strip().lower()

    if not username or not password:
        return {
            "Status": False,
            "Message": "Username and password are required",
            "User": None
        }

    users = _load_json(USERS_FILE)
    pending = _load_json(PENDING_FILE)

    if username in users:
        return {
            "Status": False,
            "Message": "Username already taken",
            "User": None
        }

    if username in pending:
        return {
            "Status": False,
            "Message": "Request already pending approval",
            "User": None
        }

    rounds, fib_check, hashed_password = password_funct(password)
    user_id = f"usr_{len(users) + len(pending) + 1:04d}"

    new_user = {
        "user_id": user_id,
        "username": username,
        "password": hashed_password,
        "rounds": rounds,
        "fib_check": fib_check,
        "is_locked": False,
        "role": role,
        "assigned_warehouse": assigned_warehouse,
        "permissions": ["read_stock"],
        "products_managed": [],
        "suppliers_managed": [],
        "orders": [],
        "activity_log": []
    }

    pending[username] = new_user

    if not _save_json(PENDING_FILE, pending):
        return {
            "Status": False,
            "Message": "Failed to write user request",
            "User": None
        }

    return {
        "Status": True,
        "Message": "Signup request submitted for approval",
        "User": {
            "user_id": user_id,
            "username": username,
            "role": role,
            "assigned_warehouse": assigned_warehouse
        }
    }