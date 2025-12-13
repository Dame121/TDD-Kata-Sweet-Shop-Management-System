"""
Script to create the first admin user in the database.
Run this once to bootstrap your system with an admin account.
"""
from app.database import SessionLocal, User
from app.auth_utils import get_password_hash

def create_first_admin():
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.is_admin == True).first()
        if existing_admin:
            print(f"❌ Admin user already exists: {existing_admin.username}")
            print("   Use the existing admin credentials or update them through the API.")
            return
        
        # Create first admin
        print("Creating first admin user...")
        first_admin = User(
            username="admin",
            email="admin@sweetshop.com",
            password=get_password_hash("admin123"),  # Change this password immediately after first login!
            is_admin=True,
            is_active=True
        )
        
        db.add(first_admin)
        db.commit()
        db.refresh(first_admin)
        
        print("\n✅ First admin created successfully!")
        print("=" * 50)
        print(f"Username: {first_admin.username}")
        print(f"Email: {first_admin.email}")
        print("Password: admin123")
        print("=" * 50)
        print("\n⚠️  IMPORTANT: Change this password immediately after first login!")
        print("   POST /admins/login to get your token")
        print("   PUT /admins/{admin_id} to update your password")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_first_admin()
