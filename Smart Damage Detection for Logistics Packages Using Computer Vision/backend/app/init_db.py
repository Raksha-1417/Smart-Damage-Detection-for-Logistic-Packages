"""
Database initialization for Render deployment.
Creates all tables using the schema that matches pg.py queries exactly,
then seeds the admin user. Safe to run on every startup (IF NOT EXISTS).
"""
import asyncio
import asyncpg
import os
import bcrypt


async def init_db():
    dsn = os.getenv("POSTGRES_DSN")
    if not dsn:
        print("⚠️  POSTGRES_DSN not set — skipping DB init")
        return

    print("🔌 Connecting to database for init...")
    conn = await asyncpg.connect(dsn=dsn)

    await conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id       SERIAL PRIMARY KEY,
            username      VARCHAR(50)  UNIQUE NOT NULL,
            full_name     VARCHAR(100) NOT NULL,
            email         VARCHAR(100) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            role          VARCHAR(20)  DEFAULT 'inspector',
            is_active     BOOLEAN      DEFAULT TRUE,
            created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            last_login    TIMESTAMP
        );
    """)

    await conn.execute("""
        CREATE TABLE IF NOT EXISTS packages (
            package_id    SERIAL PRIMARY KEY,
            tracking_code VARCHAR(50) UNIQUE NOT NULL,
            status        VARCHAR(20) NOT NULL,
            severity      VARCHAR(20),
            damage_type   TEXT,
            confidence    FLOAT,
            timestamp     TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
            inspector_id  INTEGER,
            notes         TEXT
        );
    """)

    # Column names match what pg.py inserts/selects: original_image_url, annotated_image_url
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS inspection_images (
            image_id            SERIAL PRIMARY KEY,
            package_id          INTEGER REFERENCES packages(package_id) ON DELETE CASCADE,
            original_image_url  TEXT,
            original_s3_key     TEXT,
            annotated_image_url TEXT,
            annotated_s3_key    TEXT,
            gradcam_s3_url      TEXT,
            gradcam_s3_key      TEXT,
            shap_s3_url         TEXT,
            shap_s3_key         TEXT,
            uploaded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Primary key is 'id' (RETURNING id in pg.py); columns match insert in pg.py
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id              SERIAL PRIMARY KEY,
            image_id        INTEGER REFERENCES inspection_images(image_id) ON DELETE CASCADE,
            pred_id         VARCHAR(50),
            class_id        INTEGER,
            class_name      VARCHAR(50),
            score           FLOAT,
            confidence      FLOAT,
            x1              INTEGER,
            y1              INTEGER,
            x2              INTEGER,
            y2              INTEGER,
            crop_s3_url     TEXT,
            crop_s3_key     TEXT,
            damage_detected BOOLEAN,
            damage_type     VARCHAR(50),
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    print("✅ Tables ready")

    existing = await conn.fetchrow("SELECT user_id FROM users WHERE username = 'admin'")
    if not existing:
        hashed = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
        await conn.execute(
            """INSERT INTO users (username, full_name, email, hashed_password, role)
               VALUES ($1, $2, $3, $4, $5)""",
            "admin", "Administrator", "admin@logivision.com", hashed, "admin"
        )
        print("✅ Admin user created  (username: admin  password: admin123)")
    else:
        print("ℹ️  Admin user already exists")

    await conn.close()
    print("✅ Database init complete")


if __name__ == "__main__":
    asyncio.run(init_db())
