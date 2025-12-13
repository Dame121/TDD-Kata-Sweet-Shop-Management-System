"""
Migration script to add missing columns to the sweets table.
"""
import sqlite3
from datetime import datetime

def migrate_sweets_table():
    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    
    print("Starting sweets table migration...")
    
    # Get current columns
    cursor.execute("PRAGMA table_info(sweets)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Current columns: {columns}")
    
    # Add description column if missing
    if 'description' not in columns:
        print("Adding 'description' column...")
        cursor.execute("ALTER TABLE sweets ADD COLUMN description TEXT")
        print("✅ Added 'description' column")
    else:
        print("⏭️  'description' column already exists")
    
    # Add created_at column if missing
    if 'created_at' not in columns:
        print("Adding 'created_at' column...")
        cursor.execute(f"ALTER TABLE sweets ADD COLUMN created_at DATETIME DEFAULT '{datetime.utcnow().isoformat()}' NOT NULL")
        print("✅ Added 'created_at' column")
    else:
        print("⏭️  'created_at' column already exists")
    
    # Add updated_at column if missing
    if 'updated_at' not in columns:
        print("Adding 'updated_at' column...")
        cursor.execute(f"ALTER TABLE sweets ADD COLUMN updated_at DATETIME DEFAULT '{datetime.utcnow().isoformat()}' NOT NULL")
        print("✅ Added 'updated_at' column")
    else:
        print("⏭️  'updated_at' column already exists")
    
    conn.commit()
    
    print("\n✅ Migration completed successfully!")
    
    # Show updated schema
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='sweets'")
    schema = cursor.fetchone()[0]
    print("\nUpdated schema:")
    print(schema)
    
    conn.close()

if __name__ == "__main__":
    migrate_sweets_table()
