from datetime import datetime, timezone
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from app.db.database import find_user_by_email, save_user, is_db_connected
from app.utils.security import hash_password, verify_pass

router = APIRouter()

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=1)

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=1)

@router.post("/signup")
async def signup(payload: SignupRequest):
    email = payload.email.strip().lower()
    name = payload.name.strip()

    try:
        existing = await find_user_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered. Please sign in instead.",
            )

        user_doc = {
            "name": name,
            "email": email,
            "password_hash": hash_password(payload.password),
            "created_at": datetime.now(timezone.utc),
        }

        user_id = await save_user(user_doc)

        user_info = {
            "id": user_id,
            "name": name,
            "email": email,
        }

        return {
            "status": "success",
            "message": "Account created successfully",
            "user": user_info,
            "users": user_info,
            "connected_to_atlas": is_db_connected(),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f" Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )

@router.post("/login")
async def login(payload: LoginRequest):
    email = payload.email.strip().lower()

    try:
        user = await find_user_by_email(email)
        if not user or not verify_pass(payload.password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials.",
            )

        user_info = {
            "id": str(user.get("_id", user.get("id", ""))),
            "name": user.get("name", "User"),
            "email": user.get("email", email),
        }

        return {
            "status": "success",
            "message": "Signed in successfully",
            "user": user_info,
            "users": user_info,
            "connected_to_atlas": is_db_connected(),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f" Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )
