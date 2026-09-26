from typing import Optional
from fastapi import FastAPI, Request
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

# from modules import reviews

from auth.login import login
from auth.signup import signup

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="StockSense")

app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class LoginData(BaseModel):
    email: str     
    password: str

class SignupData(BaseModel):
    email: str     
    password: str
    name: str = "New User"
    role: str = "warehouse_staff"

# @app.get("/api/reviews")
# def get_reviews():
#     content = reviews.reviews()
#     return content

@app.post("/api/login")
@limiter.limit("5/15minute")  
def user_login(request: Request, data: LoginData):
    log_data = login(data.email, data.password)
    
    if log_data["Status"] == True:
        return log_data
    else:
        return "Invalid Data"

@app.post("/api/signup")
def user_signup(data: SignupData):
    sign_data = signup(data.email, data.password, data.name, data.role)
    
    if sign_data["Status"] == True:
        return sign_data
    else:
        return sign_data