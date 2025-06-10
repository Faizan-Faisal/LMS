from pydantic import BaseModel

class StudentLogin(BaseModel):
    student_id: str
    cnic: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None 