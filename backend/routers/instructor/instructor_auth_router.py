from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt

from database import get_db
from crud.instructor import instructor_crud as crud_instructor
from models.instructor.instructor_auth import Token, TokenData

# Configuration for JWT (replace with environment variables in production)
SECRET_KEY = "your-secret-key" # Change this to a strong, random key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(tags=["Instructor Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="instructor/token")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    instructor = crud_instructor.verify_instructor_password(db, form_data.username, form_data.password)
    if not instructor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": instructor.instructor_id,
            "department_name": instructor.department # Include department_name in token
        },
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


async def get_current_instructor(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        token_data = TokenData(username=username)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return token_data 