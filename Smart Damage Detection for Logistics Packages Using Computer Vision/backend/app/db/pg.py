"""
PostgreSQL Database Operations - Enhanced Version
Author: RakshaRajkumar14
Date: 2025-11-16 10:59:22 UTC
"""

import os
import asyncpg
from typing import Optional, Dict, List

POSTGRES_DSN = os.getenv("POSTGRES_DSN")

_pool: Optional[asyncpg.Pool] = None

async def init_pool():
    """Initialize connection pool"""
    global _pool
    if _pool is None:
        if not POSTGRES_DSN:
            raise RuntimeError("POSTGRES_DSN not set in .env")
        _pool = await asyncpg.create_pool(dsn=POSTGRES_DSN, min_size=1, max_size=10)
        print(f"✅ Database pool initialized: IUProjectLocal")
    return _pool

async def close_pool():
    """Close connection pool"""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        print("🔒 Database pool closed")

# ============================================================================
# USER OPERATIONS
# ============================================================================

async def get_user_by_username(username: str):
    """Get user by username"""
    pool = await init_pool()
    return await pool.fetchrow(
        "SELECT * FROM users WHERE username = $1", 
        username
    )

async def update_last_login(username: str):
    """Update user's last login timestamp"""
    pool = await init_pool()
    await pool.execute(
        "UPDATE users SET last_login = NOW() WHERE username = $1",
        username
    )

# ============================================================================
# PACKAGE OPERATIONS
# ============================================================================

async def insert_package(
    tracking_code: str, 
    status: str, 
    severity: str, 
    damage_type: str, 
    confidence: float, 
    inspected_at=None,
    inspector_id: int = None,
    notes: str = None
):
    """Insert package record"""
    pool = await init_pool()
    q = """
    INSERT INTO packages (
        tracking_code, status, severity, damage_type, confidence, 
        timestamp, inspector_id, notes
    )
    VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW() AT TIME ZONE 'UTC'), $7, $8)
    RETURNING package_id;
    """
    row = await pool.fetchrow(
        q, tracking_code, status, severity, damage_type, confidence, 
        inspected_at, inspector_id, notes
    )
    return row['package_id']

async def get_package_by_tracking_code(tracking_code: str):
    """Get package by tracking code"""
    pool = await init_pool()
    return await pool.fetchrow(
        "SELECT * FROM packages WHERE tracking_code = $1", 
        tracking_code
    )

async def get_recent_packages(limit: int = 10):
    """Get recent packages"""
    pool = await init_pool()
    return await pool.fetch(
        "SELECT * FROM packages ORDER BY timestamp DESC LIMIT $1", 
        limit
    )

async def get_packages_today():
    """Get today's packages count"""
    pool = await init_pool()
    return await pool.fetchval("""
        SELECT COUNT(*) FROM packages 
        WHERE DATE(timestamp) = CURRENT_DATE
    """) or 0

async def get_damaged_packages_today():
    """Get today's damaged packages count"""
    pool = await init_pool()
    return await pool.fetchval("""
        SELECT COUNT(*) FROM packages 
        WHERE DATE(timestamp) = CURRENT_DATE AND status = 'damaged'
    """) or 0

# ============================================================================
# IMAGE OPERATIONS
# ============================================================================

async def insert_image(
    package_id: int, 
    original_s3_url: str = None,
    original_s3_key: str = None,
    annotated_s3_url: str = None,
    annotated_s3_key: str = None,
    gradcam_s3_url: str = None,
    gradcam_s3_key: str = None,
    shap_s3_url: str = None,
    shap_s3_key: str = None
):
    """Insert image record"""
    pool = await init_pool()
    q = """
    INSERT INTO inspection_images (
        package_id, 
        original_image_url, original_s3_key,
        annotated_image_url, annotated_s3_key,
        gradcam_s3_url, gradcam_s3_key,
        shap_s3_url, shap_s3_key,
        uploaded_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING image_id;
    """
    row = await pool.fetchrow(
        q, package_id, 
        original_s3_url, original_s3_key,
        annotated_s3_url, annotated_s3_key,
        gradcam_s3_url, gradcam_s3_key,
        shap_s3_url, shap_s3_key
    )
    return row['image_id']

async def update_image_urls(
    image_id: int,
    annotated_s3_url: str = None,
    annotated_s3_key: str = None,
    gradcam_s3_url: str = None,
    gradcam_s3_key: str = None,
    shap_s3_url: str = None,
    shap_s3_key: str = None
):
    """Update image with additional URLs"""
    pool = await init_pool()
    
    updates = []
    values = []
    param_num = 1
    
    if annotated_s3_url:
        updates.append(f"annotated_image_url = ${param_num}")
        values.append(annotated_s3_url)
        param_num += 1
        updates.append(f"annotated_s3_key = ${param_num}")
        values.append(annotated_s3_key)
        param_num += 1
    
    if gradcam_s3_url:
        updates.append(f"gradcam_s3_url = ${param_num}")
        values.append(gradcam_s3_url)
        param_num += 1
        updates.append(f"gradcam_s3_key = ${param_num}")
        values.append(gradcam_s3_key)
        param_num += 1
    
    if shap_s3_url:
        updates.append(f"shap_s3_url = ${param_num}")
        values.append(shap_s3_url)
        param_num += 1
        updates.append(f"shap_s3_key = ${param_num}")
        values.append(shap_s3_key)
        param_num += 1
    
    if updates:
        values.append(image_id)
        query = f"UPDATE inspection_images SET {', '.join(updates)} WHERE image_id = ${param_num}"
        await pool.execute(query, *values)

# ============================================================================
# PREDICTION OPERATIONS
# ============================================================================

async def insert_prediction(
    image_id: int, 
    pred_id: str, 
    class_id: int, 
    class_name: str, 
    score: float, 
    x1: int, y1: int, x2: int, y2: int, 
    crop_s3_url: str = None,
    crop_s3_key: str = None
):
    """Insert prediction record"""
    try:
        pool = await init_pool()
        
        print(f"💾 Inserting prediction to DB:")
        print(f"   - image_id: {image_id}")
        print(f"   - class: {class_name}")
        print(f"   - score: {score}")
        
        q = """
        INSERT INTO predictions (
            image_id, pred_id, class_id, class_name, score, 
            confidence, x1, y1, x2, y2, 
            crop_s3_url, crop_s3_key,
            damage_detected, damage_type, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING id;
        """
        
        damage_detected = class_name.lower() not in ['no_damage', 'none']
        
        row = await pool.fetchrow(
            q, image_id, pred_id, class_id, class_name, score,
            score, x1, y1, x2, y2, crop_s3_url, crop_s3_key,
            damage_detected, class_name
        )
        
        pred_id = row['id']
        print(f"   ✅ Inserted successfully with ID: {pred_id}")
        return pred_id
        
    except Exception as e:
        print(f"   ❌ Insert failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    
# ============================================================================
# ANALYTICS OPERATIONS
# ============================================================================

async def get_analytics_data() -> Dict:
    """Get comprehensive analytics data"""
    pool = await init_pool()
    
    # Detection accuracy trend (last 7 days)
    accuracy_trend = await pool.fetch("""
        SELECT 
            DATE(timestamp) as date,
            AVG(confidence) * 100 as accuracy,
            COUNT(*) as inspections
        FROM packages 
        WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
    """)
    
    # Hourly detection statistics for today
    hourly_stats = await pool.fetch("""
        SELECT 
            EXTRACT(HOUR FROM timestamp) as hour,
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'damaged' THEN 1 END) as damaged
        FROM packages 
        WHERE DATE(timestamp) = CURRENT_DATE
        GROUP BY EXTRACT(HOUR FROM timestamp)
        ORDER BY hour
    """)
    
    return {
        'accuracy_trend': [
            {
                'date': row['date'].isoformat(),
                'accuracy': round(row['accuracy'], 1) if row['accuracy'] else 0,
                'inspections': row['inspections']
            }
            for row in accuracy_trend
        ],
        'hourly_stats': [
            {
                'hour': int(row['hour']),
                'total': row['total'],
                'damaged': row['damaged'],
                'clean': row['total'] - row['damaged']
            }
            for row in hourly_stats
        ]
    }

# ============================================================================
# DASHBOARD STATISTICS
# ============================================================================

async def get_dashboard_stats() -> Dict:
    """Get complete dashboard statistics"""
    pool = await init_pool()
    
    # Total packages today
    total_packages = await pool.fetchval("""
        SELECT COUNT(*) FROM packages 
        WHERE DATE(timestamp) = CURRENT_DATE
    """) or 0
    
    # Total inspections (all time)
    total_inspections = await pool.fetchval("""
        SELECT COUNT(*) FROM packages
    """) or 0
    
    # Damaged packages today
    total_damages_today = await pool.fetchval("""
        SELECT COUNT(*) FROM packages 
        WHERE DATE(timestamp) = CURRENT_DATE AND status = 'damaged'
    """) or 0
    
    # Total damaged packages (all time)
    total_damages = await pool.fetchval("""
        SELECT COUNT(*) FROM packages 
        WHERE status = 'damaged'
    """) or 0
    
    # Damage types breakdown
    damage_types = await pool.fetch("""
        SELECT damage_type, COUNT(*) as count 
        FROM packages 
        WHERE status = 'damaged' AND damage_type != 'None'
        GROUP BY damage_type 
        ORDER BY count DESC
    """)
    
    damage_breakdown = {
        'crushed': 0,
        'torn': 0,
        'dented': 0,
        'wet': 0,
        'other': 0
    }
    
    for dt in damage_types:
        damage_type = dt['damage_type'].lower()
        if damage_type in damage_breakdown:
            damage_breakdown[damage_type] = dt['count']
        else:
            damage_breakdown['other'] += dt['count']
    
    # Most common damage
    most_common_damage = damage_types[0]['damage_type'] if damage_types else 'None'
    
    # Detection accuracy (based on confidence scores)
    avg_confidence = await pool.fetchval("""
        SELECT AVG(confidence) FROM packages WHERE confidence > 0
    """) or 0
    
    # Damage rate
    damage_rate = (total_damages / total_inspections * 100) if total_inspections > 0 else 0
    
    # Recent detections - limit to 10 for dashboard
    recent = await pool.fetch("""
        SELECT 
            p.package_id,
            p.tracking_code,
            p.damage_type,
            p.severity,
            p.confidence,
            p.timestamp,
            p.status
        FROM packages p
        ORDER BY p.timestamp DESC
        LIMIT 10
    """)
    
    recent_detections = [
        {
            'id': r['tracking_code'],
            'damageType': r['damage_type'] if r['status'] == 'damaged' else 'No damage',
            'damageClass': r['severity'] if r['status'] == 'damaged' else 'Clean',
            'timestamp': r['timestamp'].isoformat() + 'Z',
            'confidence': round(r['confidence'] * 100, 1) if r['confidence'] else 0,
            'status': r['status']
        }
        for r in recent
    ]
    
    return {
        'total_packages_today': total_packages,
        'total_inspections': total_inspections,
        'total_damages_today': total_damages_today,
        'total_damages': total_damages,
        'most_common_damage': most_common_damage,
        'damage_rate': round(damage_rate, 1),
        'detection_accuracy': round(avg_confidence * 100, 1) if avg_confidence else 0,
        'damage_breakdown': damage_breakdown,
        'recent_detections': recent_detections
    }