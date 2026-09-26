from fastapi import FastAPI, Request
from pydantic import BaseModel, EmailStr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from auth.login import login
from auth.signup import signup

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="StockSense")

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class LoginData(BaseModel):
    email: EmailStr     
    password: str

class SignupData(BaseModel):
    email: EmailStr     
    password: str
    full_name: str
    role: str = "staff"

@app.post("/api/auth/login")
@limiter.limit("5/minute")  
def user_login(request: Request, data: LoginData):
    # Route handles the HTTPException if thrown inside login()
    return login(data.email, data.password)

@app.post("/api/auth/register")
def user_signup(data: SignupData):
    return signup(data.email, data.password, data.full_name, data.role)