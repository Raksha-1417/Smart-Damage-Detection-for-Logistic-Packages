"""
Database Check Script
Author: RakshaRajkumar14
Date: 2025-11-18 14:29:14 UTC
"""

import asyncpg
import asyncio
from datetime import datetime

async def check_database():
    """Check database contents"""
    
    # Connect to database
    conn = await asyncpg.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='IUProjectLocal'
    )
    
    print("=" * 60)
    print("📊 DATABASE STATUS CHECK")
    print("=" * 60)
    print(f"🕐 Time: {datetime.now()}")
    print()
    
    try:
        # Check users
        users_count = await conn.fetchval("SELECT COUNT(*) FROM users")
        print(f"👥 Users: {users_count}")
        
        users = await conn.fetch("SELECT username, full_name, role FROM users")
        for user in users:
            print(f"   - {user['username']} ({user['full_name']}) - {user['role']}")
        print()
        
        # Check packages
        packages_count = await conn.fetchval("SELECT COUNT(*) FROM packages")
        print(f"📦 Total Packages: {packages_count}")
        
        # Check inspection images
        images_count = await conn.fetchval("SELECT COUNT(*) FROM inspection_images")
        print(f"🖼️  Total Images: {images_count}")
        
        # Check predictions
        predictions_count = await conn.fetchval("SELECT COUNT(*) FROM predictions")
        print(f"🔍 Total Predictions: {predictions_count}")
        
        # Check damaged packages
        damaged_count = await conn.fetchval(
            "SELECT COUNT(*) FROM predictions WHERE damage_detected = true"
        )
        print(f"⚠️  Damaged Packages: {damaged_count}")
        
        # Check today's stats
        today_count = await conn.fetchval("""
            SELECT COUNT(*) FROM predictions 
            WHERE DATE(created_at) = CURRENT_DATE
        """)
        print(f"📅 Today's Scans: {today_count}")
        print()
        
        # Show recent predictions
        print("🔄 Recent Predictions (Last 5):")
        recent = await conn.fetch("""
            SELECT 
                p.id,
                p.damage_type,
                p.confidence,
                p.damage_detected,
                p.created_at
            FROM predictions p
            ORDER BY p.created_at DESC
            LIMIT 5
        """)
        
        if recent:
            for pred in recent:
                status = "✅ Damaged" if pred['damage_detected'] else "✔️  Passed"
                print(f"   {status} - {pred['damage_type']} ({pred['confidence']}%) - {pred['created_at']}")
        else:
            print("   No predictions found")
        
        print()
        print("=" * 60)
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_database())