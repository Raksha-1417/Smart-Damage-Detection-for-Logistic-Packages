import asyncio
import asyncpg
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def fix_admin():
    print("🔧 Fixing admin user...")
    
    # Generate proper hash for "admin123"
    correct_hash = pwd_context.hash("admin123")
    print(f"✅ Generated new hash: {correct_hash[:50]}...")
    
    # Connect to database
    conn = await asyncpg.connect(
        user='postgres',
        password='postgres123',
        database='IUProjectLocal',
        host='localhost',
        port=5432
    )
    
    # Delete old admin user
    await conn.execute("DELETE FROM users WHERE username = 'admin'")
    print("🗑️  Deleted old admin user")
    
    # Insert new admin user with correct hash
    await conn.execute('''
        INSERT INTO users (username, full_name, email, hashed_password, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
    ''', 'admin', 'Administrator', 'admin@packageai.com', correct_hash, 'admin', True)
    
    print("✅ Created new admin user")
    
    # Verify
    user = await conn.fetchrow("SELECT username, email, role, is_active FROM users WHERE username = 'admin'")
    print(f"\n✨ Admin user verified:")
    print(f"   Username: {user['username']}")
    print(f"   Email: {user['email']}")
    print(f"   Role: {user['role']}")
    print(f"   Active: {user['is_active']}")
    
    # Test password verification
    user_with_hash = await conn.fetchrow("SELECT hashed_password FROM users WHERE username = 'admin'")
    test_verify = pwd_context.verify("admin123", user_with_hash['hashed_password'])
    print(f"   Password test: {'✅ PASS' if test_verify else '❌ FAIL'}")
    
    await conn.close()
    
    print("\n🎉 Admin user fixed!")
    print("\n🔐 Login credentials:")
    print("   Username: admin")
    print("   Password: admin123")

asyncio.run(fix_admin())
