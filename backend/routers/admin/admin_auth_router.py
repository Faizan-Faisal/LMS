from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from jose import jwt
from jose.exceptions import JWTError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import get_db
from models.admin.admins import AdminUser  # Adjust import if needed
from passlib.context import CryptContext

# Placeholder for Admin authentication

SECRET_KEY = "admin-super-secret-key-that-should-be-changed-in-production" # Different key from instructor_auth_router
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # You can adjust this for admin tokens

router = APIRouter(prefix="/admin", tags=["Admin Auth"])

# We remove the create_access_token as we are not using token-based auth for admin login now

async def get_current_admin(token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="admin/token", auto_error=False))):
    # Since admin login is not credential-based for now, we'll assume direct access to admin portal implies admin user
    # In a real application, you would implement proper admin authentication here.
    # For now, if get_current_admin is called (meaning an admin related endpoint is hit),
    # we return a placeholder admin object.
    print("[DEBUG] get_current_admin called. Assuming admin access.")
    return {"username": "admin", "id": "admin_123"}

# We remove the /token endpoint for admin login as we are not using token-based auth for admin login now

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not admin or not pwd_context.verify(form_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(admin.admin_id), "username": admin.username, "role": "admin", "exp": datetime.utcnow() + access_token_expires}
    access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer", "admin_id": admin.admin_id}

# You can add admin-specific authentication endpoints here later if needed.
# For example:
# @router.post("/token")
# async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     # ... admin login logic ...
#     pass 