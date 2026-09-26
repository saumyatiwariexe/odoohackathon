import json
import hashlib
from pathlib import Path

DATA_DIR = Path("data") / "users"
USERS_FILE = DATA_DIR / "users.json"


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


def password_matches(password: str, rounds: int, fib_check: int, stored_hash: str) -> bool:
    curr_hash = password.encode("utf-8")
    for _ in range(rounds):
        curr_hash = hashlib.sha256(curr_hash + str(fib_check).encode()).digest()

    return hashlib.sha256(curr_hash).hexdigest() == stored_hash


def _load_users():
    if not USERS_FILE.exists():
        return None
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def login(username: str = "", password: str = ""):
    username = username.strip().lower()
    users = _load_users()

    if users is None or username not in users:
        return {
            "Status": False,
            "Message": "Invalid credentials",
            "User": None
        }

    user = users[username]
    stored_hash = user.get("password")
    is_locked = user.get("is_locked", False)

    authenticated = False

    if is_locked:
        if password == stored_hash:
            authenticated = True
        else:
            return {
                "Status": False,
                "Message": "Account is locked",
                "User": None
            }
    else:
        rounds = user.get("rounds", 8)
        fib_check = user.get("fib_check", 0)
        if password_matches(password, rounds, fib_check, stored_hash):
            authenticated = True

    if authenticated:
        return {
            "Status": True,
            "Message": "Login successful",
            "User": {
                "user_id": user.get("user_id"),
                "username": username,
                "role": user.get("role", "staff"),
                "is_locked": is_locked,
                "assigned_warehouse": user.get("assigned_warehouse"),
                "permissions": user.get("permissions", []),
                "products_managed": user.get("products_managed", []),
                "suppliers_managed": user.get("suppliers_managed", []),
                "orders": user.get("orders", []),
                "activity_log": user.get("activity_log", [])
            }
        }

    return {
        "Status": False,
        "Message": "Invalid credentials",
        "User": None
    }