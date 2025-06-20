from fastapi import APIRouter, Depends, HTTPException, status, Form, Body
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List

from database import get_db
from models.admin.admins import AdminUser, AdminRole, AdminPermission, AdminRolePermission, AdminUserRole
from crud.admin import admins as admin_crud  # assuming the crud file is named admin_crud.py

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------- AUTH --------------------
@router.post("/login")
def admin_login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    print(f"Login attempt: username={username}, password={password}")
    admin = admin_crud.get_admin_by_username(db, username)
    if not admin:
        print("Admin not found")
        raise HTTPException(status_code=404, detail="Admin not found")
    print(f"Admin found: username={admin.username}, hash={admin.password_hash}")
    if not admin_crud.verify_password(password, admin.password_hash):
        print("Password check failed")
        raise HTTPException(status_code=400, detail="Incorrect password")
    print("Login successful")
    return {"message": "Login successful", "admin_id": admin.admin_id, "username": admin.username}

# -------------------- ADMIN CREATION --------------------
@router.post("/create")
def create_admin(
    username: str = Form(...),
    password: str = Form(...),
    email: str = Form(...),
    full_name: str = Form(...),
    db: Session = Depends(get_db)
):
    admin = admin_crud.create_admin(db, username, password, email, full_name)
    return {"message": "Admin created", "admin_id": admin.admin_id}

# -------------------- ROLE CREATION --------------------
@router.post("/roles/create")
def create_role(role_name: str = Form(...), description: str = Form(None), db: Session = Depends(get_db)):
    role = admin_crud.create_role(db, role_name, description)
    return {"message": "Role created", "role_id": role.role_id}

# -------------------- PERMISSION CREATION --------------------
@router.post("/permissions/create")
def create_permission(permission_name: str = Form(...), description: str = Form(None), db: Session = Depends(get_db)):
    permission = admin_crud.create_permission(db, permission_name, description)
    return {"message": "Permission created", "permission_id": permission.permission_id}

# -------------------- ASSIGN ROLE TO ADMIN --------------------
@router.post("/assign-role")
def assign_role(admin_id: int = Form(...), role_id: int = Form(...), db: Session = Depends(get_db)):
    admin_crud.assign_role_to_admin(db, admin_id, role_id)
    return {"message": "Role assigned to admin"}

# -------------------- ASSIGN PERMISSION TO ROLE --------------------
@router.post("/assign-permission")
def assign_permission(role_id: int = Form(...), permission_id: int = Form(...), db: Session = Depends(get_db)):
    admin_crud.assign_permission_to_role(db, role_id, permission_id)
    return {"message": "Permission assigned to role"}

@router.get("/all")
def get_all_admins(db: Session = Depends(get_db)):
    admins = db.query(AdminUser).all()
    return [
        {
            "admin_id": admin.admin_id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "created_at": admin.created_at
        }
        for admin in admins
    ]

@router.get("/{admin_id}")
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {
        "admin_id": admin.admin_id,
        "username": admin.username,
        "email": admin.email,
        "full_name": admin.full_name,
        "created_at": admin.created_at
    }

@router.put("/{admin_id}")
def update_admin(admin_id: int, db: Session = Depends(get_db), username: str = Body(None), email: str = Body(None), full_name: str = Body(None), password: str = Body(None)):
    admin = db.query(AdminUser).filter(AdminUser.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if username:
        admin.username = username
    if email:
        admin.email = email
    if full_name:
        admin.full_name = full_name
    if password:
        from crud.admin.admins import hash_password
        admin.password_hash = hash_password(password)
    db.commit()
    db.refresh(admin)
    return {"message": "Admin updated", "admin_id": admin.admin_id}

@router.delete("/{admin_id}")
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    db.delete(admin)
    db.commit()
    return {"message": "Admin deleted"}

@router.get("/roles/all")
def get_all_roles(db: Session = Depends(get_db)):
    roles = db.query(AdminRole).all()
    return [
        {"role_id": role.role_id, "role_name": role.role_name, "description": role.description}
        for role in roles
    ]

@router.get("/permissions/all")
def get_all_permissions(db: Session = Depends(get_db)):
    permissions = db.query(AdminPermission).all()
    return [
        {"permission_id": perm.permission_id, "permission_name": perm.permission_name, "description": perm.description}
        for perm in permissions
    ]
