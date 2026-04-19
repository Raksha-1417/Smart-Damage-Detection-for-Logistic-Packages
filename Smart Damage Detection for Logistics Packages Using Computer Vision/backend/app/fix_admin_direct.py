import asyncio
import asyncpg
import bcrypt

async def fix_admin():
    print("🔧 Fixing admin user with direct bcrypt...")
    
    # Generate hash using bcrypt directly
    password = "admin123"
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    print(f"✅ Generated hash: {hashed[:50]}...")
    
    # Test the hash works
    test_verify = bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    print(f"✅ Hash verification test: {'PASS' if test_verify else 'FAIL'}")
    
    # Connect to database
    conn = await asyncpg.connect(
        user='postgres',
        password='postgres123',
        database='IUProjectLocal',
        host='localhost',
        port=5432
    )
    
    # Delete old admin
    await conn.execute("DELETE FROM users WHERE username = 'admin'")
    print("🗑️  Deleted old admin user")
    
    # Insert new admin with working hash
    await conn.execute('''
        INSERT INTO users (username, full_name, email, hashed_password, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
    ''', 'admin', 'Administrator', 'admin@packageai.com', hashed, 'admin', True)
    
    print("✅ Created new admin user")
    
    # Verify in database
    user = await conn.fetchrow("SELECT * FROM users WHERE username = 'admin'")
    print(f"\n✨ Admin user in database:")
    print(f"   Username: {user['username']}")
    print(f"   Email: {user['email']}")
    print(f"   Role: {user['role']}")
    print(f"   Active: {user['is_active']}")
    
    # Test password verification with database hash
    db_hash = user['hashed_password']
    final_test = bcrypt.checkpw(password.encode('utf-8'), db_hash.encode('utf-8'))
    print(f"   Password verification: {'✅ PASS' if final_test else '❌ FAIL'}")
    
    await conn.close()
    
    print("\n🎉 Admin user fixed!")
    print("\n🔐 Login credentials:")
    print("   Username: admin")
    print("   Password: admin123")

asyncio.run(fix_admin())
