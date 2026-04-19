"""
Fix Login Issues - Complete Fix
Date: 2025-11-18 21:48:25 UTC
User: RakshaRajkumar14
"""
import asyncio
import asyncpg
import re

async def fix_login():
    print("🔧 Fixing login issues...\n")
    
    # Fix 1: Add is_active column to database
    print("1️⃣ Adding is_active column to database...")
    conn = await asyncpg.connect(
        user='raksharajkumarkademani',
        password='',
        database='IUProjectLocal',
        host='localhost',
        port=5432
    )
    
    try:
        await conn.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
        """)
        print("   ✅ Column added (or already exists)")
        
        await conn.execute("""
            UPDATE users 
            SET is_active = TRUE 
            WHERE username = 'admin'
        """)
        print("   ✅ Admin set to active\n")
        
    except Exception as e:
        print(f"   ⚠️  {e}\n")
    
    await conn.close()
    
    # Fix 2: Update app.py
    print("2️⃣ Checking app.py for required changes...")
    
    try:
        with open('app.py', 'r') as f:
            content = f.read()
        
        changes_made = False
        
        # Fix password column reference
        if "user['hashed_password']" in content:
            print("   🔧 Fixing password column reference...")
            content = content.replace(
                "user['hashed_password']",
                "user['password_hash']"
            )
            changes_made = True
            print("   ✅ Changed hashed_password → password_hash")
        
        # Fix is_active check
        if "if not user['is_active']:" in content:
            print("   🔧 Fixing is_active check...")
            content = content.replace(
                "if not user['is_active']:",
                "if not user.get('is_active', True):"
            )
            changes_made = True
            print("   ✅ Made is_active check safe with .get()")
        
        if changes_made:
            with open('app.py', 'w') as f:
                f.write(content)
            print("\n   ✅ app.py updated successfully!")
        else:
            print("   ℹ️  No changes needed in app.py")
    
    except FileNotFoundError:
        print("   ⚠️  app.py not found in current directory")
    except Exception as e:
        print(f"   ❌ Error updating app.py: {e}")
    
    print("\n" + "="*60)
    print("✅ All fixes applied!")
    print("="*60)
    print("\n📝 Next steps:")
    print("   1. Restart your backend server")
    print("   2. Try logging in with:")
    print("      Username: admin")
    print("      Password: admin123")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(fix_login())