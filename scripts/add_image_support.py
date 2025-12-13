"""
Migration script to add image_url and image_id columns to sweets table.
Run this script to update your existing database.
"""
import sqlite3
import os

def migrate_database():
    db_path = "./test.db"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Run the application first to create it.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(sweets)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "image_url" in columns and "image_id" in columns:
            print("✅ Image columns already exist. No migration needed.")
            return
        
        # Add image_url column if it doesn't exist
        if "image_url" not in columns:
            print("Adding image_url column...")
            cursor.execute("ALTER TABLE sweets ADD COLUMN image_url VARCHAR(500)")
            print("✅ Added image_url column")
        
        # Add image_id column if it doesn't exist
        if "image_id" not in columns:
            print("Adding image_id column...")
            cursor.execute("ALTER TABLE sweets ADD COLUMN image_id VARCHAR(255)")
            print("✅ Added image_id column")
        
        conn.commit()
        print("\n🎉 Database migration completed successfully!")
        print("You can now upload images for your sweets.")
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Starting database migration...")
    print("Adding image support to sweets table...\n")
    migrate_database()
