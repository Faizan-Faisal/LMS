from pydantic import BaseModel

class InstructorLogin(BaseModel):
    instructor_id: str
    cnic: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None 