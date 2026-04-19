"""
Check Users Table and Fix Column References
"""
import asyncio
import asyncpg

async def check_columns():
    print("🔍 Checking users table structure...\n")
    
    conn = await asyncpg.connect(
        user='raksharajkumarkademani',
        password='',
        database='IUProjectLocal',
        host='localhost',
        port=5432
    )
    
    # Get column info
    columns = await conn.fetch("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
    """)
    
    print("📋 Columns in users table:")
    print("-" * 60)
    col_names = []
    for col in columns:
        col_name = col['column_name']
        col_names.append(col_name)
        print(f"  {col_name:20s} | {col['data_type']:15s} | {'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'}")
    print("-" * 60)
    
    # Check what we need for login
    print("\n🔍 Login Requirements Check:")
    
    checks = {
        'username': 'username' in col_names,
        'password (hash)': any('password' in c and 'hash' in c for c in col_names) or 'password_hash' in col_names or 'hashed_password' in col_names,
        'role': 'role' in col_names,
        'is_active': 'is_active' in col_names,
        'email': 'email' in col_names,
        'full_name': 'full_name' in col_names
    }
    
    for check, exists in checks.items():
        status = "✅" if exists else "❌"
        print(f"  {status} {check}")
    
    # Identify password column name
    password_col = None
    for col_name in col_names:
        if 'password' in col_name.lower():
            password_col = col_name
            print(f"\n✅ Password column name: '{password_col}'")
            break
    
    # Get admin user
    print("\n👤 Admin User Info:")
    user = await conn.fetchrow("SELECT * FROM users WHERE username = 'admin'")
    
    if user:
        print("  ✅ Admin user exists")
        for key, value in user.items():
            if 'password' not in key.lower():
                print(f"    {key}: {value}")
            else:
                print(f"    {key}: {value[:30]}... (length: {len(str(value))})")
    else:
        print("  ❌ Admin user NOT found!")
    
    await conn.close()
    
    print("\n" + "="*60)
    print("📝 REQUIRED CODE CHANGES:")
    print("="*60)
    
    if password_col:
        print(f"\nIn backend/app/app.py, use: user['{password_col}']")
        print(f"Not: user['hashed_password'] or user['password_hash']")
        print(f"\nSearch for these lines in app.py:")
        print(f"  Line ~298: if not verify_password(form_data.password, user['hashed_password']):")
        print(f"  Change to: if not verify_password(form_data.password, user['{password_col}']):")
    
    if 'is_active' not in col_names:
        print(f"\n⚠️  'is_active' column missing!")
        print(f"Either add it or comment out the check in app.py around line 309")

if __name__ == "__main__":
    asyncio.run(check_columns())