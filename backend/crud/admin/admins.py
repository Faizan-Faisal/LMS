from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models.admin.admins import AdminUser, AdminRole, AdminPermission, AdminRolePermission, AdminUserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------- UTILS ----------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ---------------------- ADMIN CRUD ----------------------
def create_admin(db: Session, username: str, email: str, password: str, full_name: str):
    hashed_password = hash_password(password)
    new_admin = AdminUser(
        username=username,
        email=email,
        password_hash=hashed_password,
        full_name=full_name
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

def get_admin_by_username(db: Session, username: str):
    return db.query(AdminUser).filter(AdminUser.username == username).first()

# ---------------------- ROLE CRUD ----------------------
def create_role(db: Session, role_name: str, description: str = None):
    new_role = AdminRole(role_name=role_name, description=description)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

def get_all_roles(db: Session):
    return db.query(AdminRole).all()

# ---------------------- PERMISSION CRUD ----------------------
def create_permission(db: Session, permission_name: str, description: str = None):
    new_perm = AdminPermission(permission_name=permission_name, description=description)
    db.add(new_perm)
    db.commit()
    db.refresh(new_perm)
    return new_perm

def get_all_permissions(db: Session):
    return db.query(AdminPermission).all()

# ---------------------- ROLE PERMISSION ----------------------
def assign_permission_to_role(db: Session, role_id: int, permission_id: int):
    link = AdminRolePermission(role_id=role_id, permission_id=permission_id)
    db.add(link)
    db.commit()
    return {"message": "Permission assigned to role"}

# ---------------------- USER ROLE ----------------------
def assign_role_to_admin(db: Session, admin_id: int, role_id: int):
    link = AdminUserRole(admin_id=admin_id, role_id=role_id)
    db.add(link)
    db.commit()
    return {"message": "Role assigned to admin"}

def get_admin_roles(db: Session, admin_id: int):
    roles = db.query(AdminUserRole).filter(AdminUserRole.admin_id == admin_id).all()
    return [r.role.role_name for r in roles]
