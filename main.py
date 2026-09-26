from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel
from modules import reviews

# Import the functions directly from their respective module files
from auth.login import login
from auth.signup import signup

app = FastAPI(title="StockSense")

class LoginData(BaseModel):
    username: str
    password: str

class SignupData(BaseModel):
    username: str
    password: str

@app.get("/api/reviews")
def get_reviews():
    content = reviews.reviews()
    return content

@app.post("/api/login")
def user_login(data: LoginData):
    log_data = login(data.username, data.password)
    
    if log_data["Status"] == True:
        return log_data
    else:
        return "Invalid Data"

@app.post("/api/signup")
def user_signup(data: SignupData):
    result = signup(data.username, data.password)
    return {
        "message": "User saved successfully",
        "data": result
    }