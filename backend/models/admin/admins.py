from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class AdminUser(Base):
    __tablename__ = "admin_users"

    admin_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    roles = relationship("AdminUserRole", back_populates="admin_user", cascade="all, delete")


class AdminRole(Base):
    __tablename__ = "admin_roles"

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

    permissions = relationship("AdminRolePermission", back_populates="role", cascade="all, delete")
    user_roles = relationship("AdminUserRole", back_populates="role", cascade="all, delete")


class AdminPermission(Base):
    __tablename__ = "admin_permissions"

    permission_id = Column(Integer, primary_key=True, autoincrement=True)
    permission_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)

    role_permissions = relationship("AdminRolePermission", back_populates="permission", cascade="all, delete")


class AdminRolePermission(Base):
    __tablename__ = "admin_role_permissions"

    role_id = Column(Integer, ForeignKey("admin_roles.role_id", ondelete="CASCADE"), primary_key=True)
    permission_id = Column(Integer, ForeignKey("admin_permissions.permission_id", ondelete="CASCADE"), primary_key=True)

    role = relationship("AdminRole", back_populates="permissions")
    permission = relationship("AdminPermission", back_populates="role_permissions")


class AdminUserRole(Base):
    __tablename__ = "admin_user_roles"

    admin_id = Column(Integer, ForeignKey("admin_users.admin_id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(Integer, ForeignKey("admin_roles.role_id", ondelete="CASCADE"), primary_key=True)

    admin_user = relationship("AdminUser", back_populates="roles")
    role = relationship("AdminRole", back_populates="user_roles")
