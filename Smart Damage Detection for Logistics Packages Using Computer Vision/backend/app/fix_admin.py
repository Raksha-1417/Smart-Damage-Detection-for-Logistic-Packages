"""
Fix Admin User with Correct bcrypt Hash - V2
"""
import asyncio
import asyncpg
import bcrypt

async def fix_admin():
    print("🔧 Fixing admin user password...")
    
    # Generate proper bcrypt hash for "admin123"
    password = "admin123"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    print(f"✅ Generated bcrypt hash: {hashed[:50]}...")
    
    # Test the hash works
    test = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    print(f"✅ Hash verification test: {'PASS ✓' if test else 'FAIL ✗'}")
    
    # Connect to database
    conn = await asyncpg.connect(
        user='raksharajkumarkademani',
        password='',
        database='IUProjectLocal',
        host='localhost',
        port=5432
    )
    
    # First, check what columns exist
    print("\n🔍 Checking users table structure...")
    columns = await conn.fetch("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
    """)
    
    print("   Columns in users table:")
    for col in columns:
        print(f"   - {col['column_name']}")
    
    # Try to find the password column
    password_column = None
    for col in columns:
        col_name = col['column_name']
        if 'password' in col_name.lower() and 'hash' in col_name.lower():
            password_column = col_name
            break
    
    if not password_column:
        print("\n❌ Could not find password hash column!")
        await conn.close()
        return
    
    print(f"\n✅ Found password column: {password_column}")
    
    # Update admin user password using the correct column name
    query = f"""
        UPDATE users 
        SET {password_column} = $1 
        WHERE username = 'admin'
    """
    
    await conn.execute(query, hashed)
    print("✅ Admin password updated in database")
    
    # Verify
    user = await conn.fetchrow("SELECT * FROM users WHERE username = 'admin'")
    
    if not user:
        print("❌ Admin user not found!")
        await conn.close()
        return
    
    print(f"\n✨ Admin user verified:")
    print(f"   Username: {user['username']}")
    
    if 'email' in user:
        print(f"   Email: {user['email']}")
    if 'role' in user:
        print(f"   Role: {user['role']}")
    if 'is_active' in user:
        print(f"   Active: {user['is_active']}")
    
    # Final test
    db_hash = user[password_column]
    final_test = bcrypt.checkpw(password.encode('utf-8'), db_hash.encode('utf-8'))
    print(f"   Password verification: {'✅ WORKING!' if final_test else '❌ STILL BROKEN'}")
    
    await conn.close()
    
    if final_test:
        print("\n🎉 Admin user fixed!")
        print("\n🔐 Login credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n🚀 Now try logging in again!")
    else:
        print("\n❌ Fix failed. Please check the logs above.")

if __name__ == "__main__":
    asyncio.run(fix_admin())