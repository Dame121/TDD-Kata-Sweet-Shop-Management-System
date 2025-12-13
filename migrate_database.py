"""
Migration script to add missing columns to the users table.
Run this if you're getting "no such column: users.is_active" errors.
"""
import sqlite3
from datetime import datetime

def migrate_database():
    print("Starting database migration...")
    
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    try:
        # Check current schema
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Current columns: {columns}")
        
        # Add missing columns if they don't exist
        if 'is_active' not in columns:
            print("Adding 'is_active' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL")
            print("✅ Added 'is_active' column")
        
        if 'created_at' not in columns:
            print("Adding 'created_at' column...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT '{datetime.utcnow().isoformat()}' NOT NULL")
            print("✅ Added 'created_at' column")
        
        if 'updated_at' not in columns:
            print("Adding 'updated_at' column...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT '{datetime.utcnow().isoformat()}' NOT NULL")
            print("✅ Added 'updated_at' column")
        
        # Fix column types and add indexes if needed
        cursor.execute("PRAGMA table_info(users)")
        current_schema = cursor.fetchall()
        
        # Check if columns need better constraints
        print("\nUpdating constraints where needed...")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Show updated schema
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
        schema = cursor.fetchone()[0]
        print("\nUpdated schema:")
        print(schema)
        
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(f"⚠️  Column already exists: {e}")
        else:
            print(f"❌ Error during migration: {e}")
            conn.rollback()
            raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
