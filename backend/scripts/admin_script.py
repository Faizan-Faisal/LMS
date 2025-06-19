# from database import SessionLocal
from crud.admin import admins as admin_crud
from sqlalchemy.exc import IntegrityError

# from database import Base
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL DB URL for XAMPP (no password case)
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost/lms_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_superadmin():
    db = SessionLocal()
    try:
        existing = admin_crud.get_admin_by_username(db, "superadmin")
        if existing:
            print("Superadmin already exists.")
            return
        admin = admin_crud.create_admin(db, "superadmin", "super@123", "superadmin@example.com", "Super Admin")
        print(f"✅ Superadmin created with ID: {admin.admin_id}")
    except IntegrityError:
        print("❌ Superadmin creation failed: User may already exist.")
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hash_from_db = "$2b$12$GHP0k.jP3/n1xSqadfxpEOsP/Z5DvM3QOX25xLI/9Sa8vhDCx/geC"
print(pwd_context.verify("superadmin", hash_from_db))
print(pwd_context.verify("super@123", hash_from_db))
print(pwd_context.verify("superadmin@example.com", hash_from_db))
