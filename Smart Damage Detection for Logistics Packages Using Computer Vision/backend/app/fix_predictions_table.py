"""
Fix Predictions Table Schema
Author: RakshaRajkumar14
Date: 2025-11-18 14:58:09 UTC
"""

import asyncpg
import asyncio

async def fix_schema():
    print("="*70)
    print("🔧 FIXING PREDICTIONS TABLE SCHEMA")
    print("="*70)
    
    conn = await asyncpg.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='IUProjectLocal'
    )
    
    try:
        # Drop old table
        print("\n1️⃣ Dropping old predictions table...")
        await conn.execute("DROP TABLE IF EXISTS predictions CASCADE;")
        print("   ✅ Old table dropped")
        
        # Create new table with ALL required columns
        print("\n2️⃣ Creating new predictions table...")
        await conn.execute('''
            CREATE TABLE predictions (
                id SERIAL PRIMARY KEY,
                image_id INTEGER REFERENCES inspection_images(image_id) ON DELETE CASCADE,
                pred_id VARCHAR(100),
                class_id INTEGER,
                class_name VARCHAR(50),
                score FLOAT,
                confidence FLOAT,
                x1 INTEGER,
                y1 INTEGER,
                x2 INTEGER,
                y2 INTEGER,
                crop_s3_url TEXT,
                crop_s3_key TEXT,
                damage_detected BOOLEAN DEFAULT FALSE,
                damage_type VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        print("   ✅ New table created with all columns")
        
        # Create indexes for performance
        print("\n3️⃣ Creating indexes...")
        await conn.execute("""
            CREATE INDEX idx_pred_image ON predictions(image_id);
            CREATE INDEX idx_pred_damage ON predictions(damage_detected);
            CREATE INDEX idx_pred_created ON predictions(created_at DESC);
        """)
        print("   ✅ Indexes created")
        
        # Verify schema
        print("\n4️⃣ Verifying schema...")
        columns = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'predictions'
            ORDER BY ordinal_position
        """)
        
        print("\n   📋 Predictions table columns:")
        for col in columns:
            print(f"      • {col['column_name']}: {col['data_type']}")
        
        print("\n" + "="*70)
        print("✨ DATABASE SCHEMA FIXED SUCCESSFULLY!")
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_schema())