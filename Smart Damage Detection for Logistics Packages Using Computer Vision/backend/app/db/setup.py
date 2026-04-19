"""
Complete Database Setup with All Tables
Author: RakshaRajkumar14
Date: 2025-11-16 10:59:22 UTC
Database: IUProjectLocal
"""

import asyncpg
import asyncio
import os
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

load_dotenv()

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header():
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*80}")
    print("🚀 LogiVision- COMPLETE DATABASE SETUP")
    print(f"{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}📅 Date: 2025-11-16 10:59:22 UTC")
    print(f"👤 User: RakshaRajkumar14")
    print(f"🗄️  Database: IUProjectLocal{Colors.END}\n")

def print_success(msg):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

async def setup_database():
    """Complete database setup with all tables"""
    
    DB_CONFIG = {
        'user': 'raksharajkumarkademani',
        'password': '',
        'host': 'localhost',
        'port': 5432,
        'database': 'IUProjectLocal'
    }
    
    print_header()
    
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        print_success("Connected to IUProjectLocal")
        
        # Drop existing tables
        print_info("\n🗑️  Dropping existing tables...")
        await conn.execute('DROP TABLE IF EXISTS predictions CASCADE')
        await conn.execute('DROP TABLE IF EXISTS inspection_images CASCADE')
        await conn.execute('DROP TABLE IF EXISTS packages CASCADE')
        await conn.execute('DROP TABLE IF EXISTS users CASCADE')
        print_success("Existing tables dropped")
        
        # Create users table (for admin login)
        print_info("\n📋 Creating database schema...")
        print("  1️⃣  Creating 'users' table...")
        await conn.execute("""
            CREATE TABLE users (
                user_id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                email VARCHAR(100),
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP
            )
        """)
        print_success("'users' table created")
        
        # Create packages table
        print("  2️⃣  Creating 'packages' table...")
        await conn.execute("""
            CREATE TABLE packages (
                package_id SERIAL PRIMARY KEY,
                tracking_code VARCHAR(100) UNIQUE NOT NULL,
                status VARCHAR(50) NOT NULL,
                severity VARCHAR(50),
                damage_type TEXT,
                confidence FLOAT,
                timestamp TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW(),
                inspector_id INTEGER,
                notes TEXT
            )
        """)
        print_success("'packages' table created")
        
        # Create inspection_images table
        print("  3️⃣  Creating 'inspection_images' table...")
        await conn.execute("""
            CREATE TABLE inspection_images (
                image_id SERIAL PRIMARY KEY,
                package_id INTEGER NOT NULL,
                original_image_url TEXT,
                original_s3_key TEXT,
                annotated_image_url TEXT,
                annotated_s3_key TEXT,
                gradcam_s3_url TEXT,
                gradcam_s3_key TEXT,
                shap_s3_url TEXT,
                shap_s3_key TEXT,
                uploaded_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT fk_package 
                    FOREIGN KEY (package_id) 
                    REFERENCES packages(package_id) 
                    ON DELETE CASCADE
            )
        """)
        print_success("'inspection_images' table created")
        
        # Create predictions table
        print("  4️⃣  Creating 'predictions' table...")
        await conn.execute("""
            CREATE TABLE predictions (
                id SERIAL PRIMARY KEY,
                image_id INTEGER NOT NULL,
                pred_id VARCHAR(100) UNIQUE,
                class_id INTEGER,
                class_name VARCHAR(100),
                score FLOAT,
                x1 INTEGER,
                y1 INTEGER,
                x2 INTEGER,
                y2 INTEGER,
                crop_s3_url TEXT,
                crop_s3_key TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                CONSTRAINT fk_image 
                    FOREIGN KEY (image_id) 
                    REFERENCES inspection_images(image_id) 
                    ON DELETE CASCADE
            )
        """)
        print_success("'predictions' table created")
        
        # Create indexes
        print_info("\n🔍 Creating indexes...")
        indexes = [
            "CREATE INDEX idx_packages_timestamp ON packages(timestamp)",
            "CREATE INDEX idx_packages_status ON packages(status)",
            "CREATE INDEX idx_packages_tracking_code ON packages(tracking_code)",
            "CREATE INDEX idx_packages_created_at ON packages(created_at)",
            "CREATE INDEX idx_images_package_id ON inspection_images(package_id)",
            "CREATE INDEX idx_predictions_image_id ON predictions(image_id)",
            "CREATE INDEX idx_predictions_class_name ON predictions(class_name)",
            "CREATE INDEX idx_users_username ON users(username)",
        ]
        for idx in indexes:
            await conn.execute(idx)
        print_success("All indexes created")
        
        # Insert admin user (password: admin123)
        print_info("\n👤 Creating admin user...")
        # Simple password hash (in production use bcrypt)
        import hashlib
        password_hash = hashlib.sha256("admin123".encode()).hexdigest()
        
        await conn.execute("""
            INSERT INTO users (username, password_hash, full_name, email, role)
            VALUES ($1, $2, $3, $4, $5)
        """, 'admin', password_hash, 'Raksha Rajkumar', 'raksha@packageai.com', 'admin')
        print_success("Admin user created (username: admin, password: admin123)")
        
        # Insert sample packages
        print_info("\n📝 Inserting sample data...")
        
        sample_packages = [
            ('PKG-20251116-SAMPLE01', 'passed', 'secondary', 'None', 0.0, 5),
            ('PKG-20251116-SAMPLE02', 'damaged', 'danger', 'Crushed Corner', 0.92, 4),
            ('PKG-20251116-SAMPLE03', 'damaged', 'warning', 'Wet, Torn', 0.75, 3),
            ('PKG-20251116-SAMPLE04', 'damaged', 'danger', 'Dent', 0.88, 2),
            ('PKG-20251116-SAMPLE05', 'passed', 'secondary', 'None', 0.0, 1),
            ('PKG-20251116-SAMPLE06', 'damaged', 'warning', 'Scratch', 0.68, 0.5),
            ('PKG-20251116-SAMPLE07', 'damaged', 'danger', 'Torn', 0.95, 0.25),
            ('PKG-20251116-SAMPLE08', 'passed', 'secondary', 'None', 0.0, 0.083),
            ('PKG-20251116-SAMPLE09', 'damaged', 'danger', 'Crushed Corner, Wet', 0.89, 0.05),
            ('PKG-20251116-SAMPLE10', 'damaged', 'warning', 'Dent, Scratch', 0.71, 0.02),
        ]
        
        package_ids = []
        now = datetime.utcnow()
        
        for tracking_code, status, severity, damage_type, confidence, hours_ago in sample_packages:
            timestamp = now - timedelta(hours=hours_ago)
            
            package_id = await conn.fetchval("""
                INSERT INTO packages (tracking_code, status, severity, damage_type, confidence, timestamp)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING package_id
            """, tracking_code, status, severity, damage_type, confidence, timestamp)
            
            package_ids.append((package_id, tracking_code, status))
        
        print_success(f"Inserted {len(package_ids)} packages")
        
        # Insert images
        for package_id, tracking_code, status in package_ids:
            await conn.execute("""
                INSERT INTO inspection_images (
                    package_id, 
                    original_image_url,
                    original_s3_key,
                    uploaded_at
                )
                VALUES ($1, $2, $3, NOW())
            """, package_id, 
                f'https://damage-detection-images-s3.s3.eu-north-1.amazonaws.com/originals/{tracking_code}/original.jpg',
                f'originals/{tracking_code}/original.jpg')
        
        print_success(f"Inserted {len(package_ids)} images")
        
        # Insert predictions for damaged packages
        damage_types = ['Crushed Corner', 'Dent', 'Scratch', 'Torn', 'Wet']
        prediction_count = 0
        
        images = await conn.fetch('SELECT image_id, package_id FROM inspection_images')
        
        for img in images:
            # Get package status
            pkg = await conn.fetchrow('SELECT status FROM packages WHERE package_id = $1', img['package_id'])
            
            if pkg and pkg['status'] == 'damaged':
                num_predictions = random.randint(1, 3)
                
                for i in range(num_predictions):
                    damage_type = random.choice(damage_types)
                    x1, y1 = random.randint(50, 300), random.randint(50, 300)
                    x2, y2 = x1 + random.randint(100, 200), y1 + random.randint(100, 200)
                    confidence = round(random.uniform(0.70, 0.99), 2)
                    class_id = damage_types.index(damage_type)
                    
                    await conn.execute("""
                        INSERT INTO predictions (
                            image_id, pred_id, class_id, class_name, 
                            score, x1, y1, x2, y2, created_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    """, img['image_id'], f'PRED-{img["image_id"]}-{i+1:03d}', class_id, 
                        damage_type, confidence, x1, y1, x2, y2)
                    
                    prediction_count += 1
        
        print_success(f"Inserted {prediction_count} predictions")
        
        # Verification
        print(f"\n{Colors.CYAN}{Colors.BOLD}{'='*80}")
        print("📊 DATABASE VERIFICATION")
        print(f"{'='*80}{Colors.END}\n")
        
        user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
        package_count = await conn.fetchval("SELECT COUNT(*) FROM packages")
        image_count = await conn.fetchval("SELECT COUNT(*) FROM inspection_images")
        pred_count = await conn.fetchval("SELECT COUNT(*) FROM predictions")
        
        print(f"{Colors.BOLD}Total Records:{Colors.END}")
        print(f"  👥 Users: {Colors.GREEN}{user_count}{Colors.END}")
        print(f"  📦 Packages: {Colors.GREEN}{package_count}{Colors.END}")
        print(f"  🖼️  Images: {Colors.GREEN}{image_count}{Colors.END}")
        print(f"  🎯 Predictions: {Colors.GREEN}{pred_count}{Colors.END}")
        
        today_packages = await conn.fetchval(
            "SELECT COUNT(*) FROM packages WHERE DATE(timestamp) = CURRENT_DATE"
        )
        today_damaged = await conn.fetchval(
            "SELECT COUNT(*) FROM packages WHERE status = 'damaged' AND DATE(timestamp) = CURRENT_DATE"
        )
        
        damage_rate = (today_damaged / today_packages * 100) if today_packages > 0 else 0
        
        print(f"\n{Colors.BOLD}Today's Activity:{Colors.END}")
        print(f"  📅 Total Inspected: {Colors.GREEN}{today_packages}{Colors.END}")
        print(f"  ⚠️  Damaged: {Colors.YELLOW}{today_damaged}{Colors.END}")
        print(f"  📈 Damage Rate: {Colors.YELLOW}{damage_rate:.1f}%{Colors.END}")
        
        await conn.close()
        
        print(f"\n{Colors.GREEN}{Colors.BOLD}")
        print("="*80)
        print("🎉 DATABASE SETUP COMPLETE!")
        print("="*80)
        print(Colors.END)
        
        print(f"\n{Colors.YELLOW}📝 Database Connection:{Colors.END}")
        print(f"   POSTGRES_DSN=postgresql://postgres:postgres123@localhost:5432/IUProjectLocalsource venv/bin/activate")
        
        print(f"\n{Colors.YELLOW}👤 Admin Login Credentials:{Colors.END}")
        print(f"   Username: admin")
        print(f"   Password: admin123")
        
        print(f"\n{Colors.GREEN}🚀 Next Steps:{Colors.END}")
        print("  1. cd backend/app")
        print("  2. pip install -r requirements.txt")
        print("  3. uvicorn app:app --reload --host 0.0.0.0 --port 8000")
        print("  4. Open http://localhost:4200 in your browser\n")
        
        return True
        
    except Exception as e:
        print_error(f"Setup failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(setup_database())
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Setup cancelled{Colors.END}")
        exit(1)