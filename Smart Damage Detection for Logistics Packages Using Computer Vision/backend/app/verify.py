"""
Verify and Fix Database Schema
Run this to ensure all tables and columns exist
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def verify_and_fix_database():
    print("\n" + "="*70)
    print("🔍 VERIFYING DATABASE SCHEMA")
    print("="*70 + "\n")
    
    try:
        # Connect to database
        dsn = os.getenv("POSTGRES_DSN", "postgresql://postgres:postgres123@localhost:5432/IUProjectLocal")
        conn = await asyncpg.connect(dsn)
        print("✅ Connected to database\n")
        
        # Check if last_login column exists
        print("1️⃣  Checking users table...")
        columns = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        """)
        
        column_names = [col['column_name'] for col in columns]
        print(f"   Found columns: {', '.join(column_names)}")
        
        if 'last_login' not in column_names:
            print("   ⚠️  Adding missing 'last_login' column...")
            await conn.execute("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
            """)
            print("   ✅ Added 'last_login' column")
        else:
            print("   ✅ 'last_login' column exists")
        
        # Check packages table
        print("\n2️⃣  Checking packages table...")
        packages_count = await conn.fetchval("SELECT COUNT(*) FROM packages")
        print(f"   📦 Total packages: {packages_count}")
        
        # Check inspection_images table
        print("\n3️⃣  Checking inspection_images table...")
        images_count = await conn.fetchval("SELECT COUNT(*) FROM inspection_images")
        print(f"   🖼️  Total images: {images_count}")
        
        # Check predictions table
        print("\n4️⃣  Checking predictions table...")
        pred_columns = await conn.fetch("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'predictions'
        """)
        pred_column_names = [col['column_name'] for col in pred_columns]
        print(f"   Found columns: {', '.join(pred_column_names)}")
        
        required_pred_columns = ['damage_detected', 'damage_type', 'confidence']
        missing_columns = [col for col in required_pred_columns if col not in pred_column_names]
        
        if missing_columns:
            print(f"   ⚠️  Missing columns: {', '.join(missing_columns)}")
            for col in missing_columns:
                if col == 'damage_detected':
                    await conn.execute("""
                        ALTER TABLE predictions 
                        ADD COLUMN IF NOT EXISTS damage_detected BOOLEAN DEFAULT FALSE
                    """)
                elif col == 'damage_type':
                    await conn.execute("""
                        ALTER TABLE predictions 
                        ADD COLUMN IF NOT EXISTS damage_type VARCHAR(100)
                    """)
                elif col == 'confidence':
                    await conn.execute("""
                        ALTER TABLE predictions 
                        ADD COLUMN IF NOT EXISTS confidence FLOAT
                    """)
            print("   ✅ Added missing columns")
        else:
            print("   ✅ All required columns exist")
        
        predictions_count = await conn.fetchval("SELECT COUNT(*) FROM predictions")
        print(f"   🎯 Total predictions: {predictions_count}")
        
        # Check today's stats
        print("\n5️⃣  Checking today's statistics...")
        today_packages = await conn.fetchval("""
            SELECT COUNT(*) FROM packages 
            WHERE DATE(timestamp) = CURRENT_DATE
        """) or 0
        
        today_damages = await conn.fetchval("""
            SELECT COUNT(*) FROM packages 
            WHERE DATE(timestamp) = CURRENT_DATE AND status = 'damaged'
        """) or 0
        
        print(f"   📅 Today's packages: {today_packages}")
        print(f"   ⚠️  Today's damages: {today_damages}")
        
        # Test dashboard stats query
        print("\n6️⃣  Testing dashboard stats query...")
        stats = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_packages,
                SUM(CASE WHEN status = 'damaged' THEN 1 ELSE 0 END) as damaged_count
            FROM packages 
            WHERE DATE(timestamp) = CURRENT_DATE
        """)
        
        if stats:
            print(f"   ✅ Query successful:")
            print(f"      Total: {stats['total_packages']}")
            print(f"      Damaged: {stats['damaged_count']}")
        
        await conn.close()
        
        print("\n" + "="*70)
        print("✅ DATABASE VERIFICATION COMPLETE")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify_and_fix_database())