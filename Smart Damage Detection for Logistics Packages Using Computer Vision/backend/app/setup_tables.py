"""
Setup database tables for LogiVision
"""
import asyncio
import asyncpg
import sys

async def setup_database():
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = await asyncpg.connect(
            user='postgres',
            password='postgres123',
            database='IUProjectLocal',
            host='localhost',
            port=5432
        )
        print("✅ Connected!\n")
        
        # Create users table
        print("📊 Creating users table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'inspector',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            );
        ''')
        print("✅ users table created")
        
        # Create packages table
        print("📊 Creating packages table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS packages (
                package_id SERIAL PRIMARY KEY,
                tracking_code VARCHAR(50) UNIQUE NOT NULL,
                status VARCHAR(20) NOT NULL,
                severity VARCHAR(20),
                damage_type TEXT,
                confidence FLOAT,
                inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                inspector_id INTEGER,
                notes TEXT
            );
        ''')
        print("✅ packages table created")
        
        # Create images table
        print("📊 Creating inspection_images table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS inspection_images (
                image_id SERIAL PRIMARY KEY,
                package_id INTEGER REFERENCES packages(package_id) ON DELETE CASCADE,
                original_s3_url TEXT,
                original_s3_key TEXT,
                annotated_s3_url TEXT,
                annotated_s3_key TEXT,
                gradcam_s3_url TEXT,
                gradcam_s3_key TEXT,
                shap_s3_url TEXT,
                shap_s3_key TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        print("✅ inspection_images table created")
        
        # Create predictions table
        print("📊 Creating predictions table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                prediction_id SERIAL PRIMARY KEY,
                image_id INTEGER REFERENCES inspection_images(image_id) ON DELETE CASCADE,
                detection_id VARCHAR(50),
                class_id INTEGER,
                class_name VARCHAR(50),
                confidence FLOAT,
                bbox_x1 INTEGER,
                bbox_y1 INTEGER,
                bbox_x2 INTEGER,
                bbox_y2 INTEGER,
                crop_s3_url TEXT,
                crop_s3_key TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        print("✅ predictions table created")
        
        # Check if admin user exists
        print("\n👤 Checking admin user...")
        existing_admin = await conn.fetchrow(
            "SELECT * FROM users WHERE username = 'admin'"
        )
        
        if existing_admin:
            print("ℹ️  Admin user already exists")
        else:
            # Insert admin user (password: admin123)
            print("👤 Creating admin user...")
            await conn.execute('''
                INSERT INTO users (username, full_name, email, hashed_password, role)
                VALUES ($1, $2, $3, $4, $5)
            ''', 'admin', 'Administrator', 'admin@packageai.com',
                 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJw5vH7sW', 'admin')
            print("✅ Admin user created")
        
        # Verify
        print("\n📋 Verifying setup...")
        users = await conn.fetch('SELECT username, full_name, role, email FROM users;')
        print(f"   Found {len(users)} user(s):")
        for user in users:
            print(f"   - {user['username']}: {user['full_name']} ({user['role']}) - {user['email']}")
        
        await conn.close()
        
        print("\n" + "="*80)
        print("✨ Database setup complete!")
        print("="*80)
        print("\n🔐 Login Credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n🚀 Now restart your backend!")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(setup_database())
    sys.exit(0 if success else 1)
