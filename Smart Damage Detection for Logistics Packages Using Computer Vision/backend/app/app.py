"""
Package Damage Detection API - Complete Application
Author: RakshaRajkumar14
Date: 2025-11-18 14:47:46 UTC
Database: IUProjectLocal (PostgreSQL)
Storage: AWS S3 (damage-detection-images-s3, eu-north-1)

Features:
- YOLO-based damage detection
- Database storage (PostgreSQL)
- S3 image storage
- GradCAM & SHAP explainability
- JWT authentication
- Real-time dashboard statistics
"""
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import os
import io
import time
import uuid
from PIL import Image, ImageOps
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import List, Dict
import bcrypt
# Add these imports at the top if not already present
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import bcrypt

# Load environment variables
load_dotenv()

# Import local modules
from services.yolo_service import predict_pil_image, init_model
from services import storage
from services.explainability_services import (
    generate_gradcam_heatmap, 
    generate_shap_explanation,
    generate_combined_explanation
)
from db import pg
from auth import (
    ALGORITHM,
    SECRET_KEY,
    authenticate_user, 
    create_access_token, 
    get_current_active_user,
    UserLogin, 
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "admin",
                "password": "admin123"
            }
        }
class SignupRequest(BaseModel):
    """Signup request model"""
    username: str
    password: str
    full_name: str
    email: EmailStr
    role: Optional[str] = "inspector"

class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    """User information response"""
    username: str
    full_name: str
    email: str
    role: str
    is_active: bool
# ============================================================================
# APPLICATION LIFECYCLE
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown"""
    print("\n" + "="*80)
    print("🚀 LOGIVISION - STARTING UP")
    print("="*80)
    print(f"📅 UTC Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"👤 User: RakshaRajkumar14")
    print(f"🗄️  Database: IUProjectLocal")
    print(f"☁️  S3 Bucket: {os.getenv('S3_BUCKET_NAME', 'Not configured')}")
    print(f"🌍 S3 Region: {os.getenv('AWS_REGION', 'Not configured')}")
    print("="*80 + "\n")
    
    # Initialize database
    if os.getenv("POSTGRES_DSN"):
        await pg.init_pool()
        print("✅ Database connected: IUProjectLocal")
    else:
        print("⚠️  POSTGRES_DSN not set - Database will not be used!")
    
    # Initialize YOLO model
    init_model()
    print(f"✅ YOLO model loaded: {os.getenv('YOLO_WEIGHTS', 'models/best.pt')}")
    
    # Check S3
    if os.getenv("S3_BUCKET_NAME"):
        print(f"✅ S3 configured: {os.getenv('S3_BUCKET_NAME')}")
    else:
        print("⚠️  S3 not configured")
    
    print("\n✨ Application ready!\n")
    
    yield
    
    # Shutdown
    print("\n🧹 Shutting down...")
    if os.getenv("POSTGRES_DSN"):
        await pg.close_pool()
    print("👋 Goodbye!\n")

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="Package Damage Detection API",
    description="Package damage detection with YOLO, GradCAM, and SHAP",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: ["http://localhost:4200"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def pil_from_bytes(b: bytes):
    """Convert bytes to PIL Image"""
    img = Image.open(io.BytesIO(b))
    return ImageOps.exif_transpose(img).convert("RGB")

def image_to_base64(image_array):
    """Convert numpy array to base64 data URL"""
    _, buffer = cv2.imencode('.jpg', image_array, [cv2.IMWRITE_JPEG_QUALITY, 90])
    img_str = base64.b64encode(buffer).decode()
    return f"data:image/jpeg;base64,{img_str}"

def get_severity_and_color(confidence: float):
    """Determine severity based on confidence"""
    if confidence >= 0.85:
        return 'danger', '#ff4d6d', (77, 77, 255)  # BGR
    elif confidence >= 0.60:
        return 'warning', '#ffa500', (0, 165, 255)
    else:
        return 'secondary', '#00ff88', (136, 255, 0)

def calculate_iou(bbox1, bbox2):
    """Calculate Intersection over Union"""
    x1_min, y1_min, x1_max, y1_max = bbox1
    x2_min, y2_min, x2_max, y2_max = bbox2
    
    inter_x_min = max(x1_min, x2_min)
    inter_y_min = max(y1_min, y2_min)
    inter_x_max = min(x1_max, x2_max)
    inter_y_max = min(y1_max, y2_max)
    
    if inter_x_max < inter_x_min or inter_y_max < inter_y_min:
        return 0.0
    
    inter_area = (inter_x_max - inter_x_min) * (inter_y_max - inter_y_min)
    bbox1_area = (x1_max - x1_min) * (y1_max - y1_min)
    bbox2_area = (x2_max - x2_min) * (y2_max - y2_min)
    union_area = bbox1_area + bbox2_area - inter_area
    
    return inter_area / union_area if union_area > 0 else 0.0

def group_overlapping_detections(predictions, iou_threshold=0.5):
    """Group overlapping detections for multi-label"""
    if len(predictions) == 0:
        return []
    
    groups = []
    used = set()
    
    for i, pred1 in enumerate(predictions):
        if i in used:
            continue
        
        group = [pred1]
        bbox1 = pred1['bbox']
        
        for j, pred2 in enumerate(predictions):
            if i >= j or j in used:
                continue
            
            bbox2 = pred2['bbox']
            iou = calculate_iou(bbox1, bbox2)
            
            if iou > iou_threshold:
                group.append(pred2)
                used.add(j)
        
        groups.append(group)
        used.add(i)
    
    return groups

def draw_detections_on_image(img_array, predictions):
    """Draw bounding boxes with multi-label support"""
    annotated = img_array.copy()
    grouped_preds = group_overlapping_detections(predictions)
    
    for group in grouped_preds:
        if len(group) == 0:
            continue
        
        bbox = group[0]['bbox']
        x1, y1, x2, y2 = [int(v) for v in bbox]
        
        max_conf = max(p['score'] for p in group)
        severity, hex_color, bgr_color = get_severity_and_color(max_conf)
        
        # Draw rectangle
        cv2.rectangle(annotated, (x1, y1), (x2, y2), bgr_color, 3)
        
        # Create label
        if len(group) == 1:
            label = f"{group[0]['class_name']} {group[0]['score']*100:.1f}%"
        else:
            damage_names = [p['class_name'] for p in group]
            avg_conf = sum(p['score'] for p in group) / len(group)
            label = f"{' & '.join(damage_names)} {avg_conf*100:.1f}%"
        
        # Draw label background and text
        font = cv2.FONT_HERSHEY_SIMPLEX
        (text_width, text_height), _ = cv2.getTextSize(label, font, 0.6, 2)
        
        label_y = y1 - 10 if y1 - 10 > text_height else y1 + text_height + 10
        
        cv2.rectangle(annotated, 
                     (x1, label_y - text_height - 8), 
                     (x1 + text_width + 10, label_y + 5), 
                     bgr_color, -1)
        
        cv2.putText(annotated, label, (x1 + 5, label_y), 
                   font, 0.6, (255, 255, 255), 2)
    
    return annotated

# ============================================================================
# AUTHENTICATION SETUP
# ===============================================-=============================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt directly"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"   ❌ Bcrypt error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

# Find the login endpoint (around line 155-185) and update it:

@app.post("/api/auth/login")
async def login(credentials: LoginRequest):
    """User login"""
    try:
        print(f"\n🔐 Login attempt for: {credentials.username}")
        
        pool = await pg.init_pool()
        user = await pool.fetchrow(
            "SELECT * FROM users WHERE username = $1",
            credentials.username
        )
        
        if not user:
            print("   ❌ User not found")
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        print(f"   ✅ User found: {user['username']}")
        print(f"   Available fields: {list(user.keys())}")
        
        # Try different password field names
        password_hash = (
            user.get('hashed_password') or 
            user.get('password') or 
            user.get('password_hash')
        )
        
        if not password_hash:
            print("   ❌ No password field found!")
            print(f"   User fields: {list(user.keys())}")
            raise HTTPException(status_code=500, detail="User password not configured")
        
        print(f"   Password field found: {len(password_hash)} chars")
        
        # Verify password
        if not verify_password(credentials.password, password_hash):
            print("   ❌ Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        print("   ✅ Password verified")
        
        # Check if active
        if not user.get('is_active', True):
            raise HTTPException(status_code=403, detail="Account is inactive")
        
        # Update last login
        try:
            await pool.execute(
                "UPDATE users SET last_login = NOW() WHERE user_id = $1",
                user['user_id']
            )
        except Exception as e:
            print(f"   ⚠️ Could not update last_login: {e}")
        
        # Create token
        access_token = create_access_token(
            data={"sub": user['username'], "user_id": user['user_id']}
        )
        
        print("   ✅ Login successful!")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": user['username'],
                "full_name": user.get('full_name', ''),
                "email": user.get('email', ''),
                "role": user.get('role', 'inspector')
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"\n❌ LOGIN ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    """Get current authenticated user info"""
    return {
        "username": current_user['username'],
        "full_name": current_user['full_name'],
        "email": current_user['email'],
        "role": current_user['role'],
        "last_login": current_user['last_login'].isoformat() if current_user['last_login'] else None
    }

# ============================================================================
# DETECTION ENDPOINT
# ============================================================================

@app.post("/api/detect")
async def detect(
    file: UploadFile = File(...), 
    tracking_code: str = None,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Complete damage detection with explainability
    
    Process:
    1. Upload original image to S3
    2. Run YOLO detection
    3. Save package to PostgreSQL
    4. Save image record with S3 URLs
    5. Upload crops to S3
    6. Save predictions to PostgreSQL
    7. Generate annotated image → S3
    8. Generate GradCAM → S3
    9. Generate SHAP → S3
    10. Return all results
    """
    
    print("\n" + "="*80)
    print(f"🚀 NEW DETECTION REQUEST - {datetime.utcnow().isoformat()}")
    print("="*80)
    print(f"👤 User: {current_user.get('username', 'Unknown')} (ID: {current_user.get('user_id', 'N/A')})")
    print(f"📁 File: {file.filename}")
    print(f"📏 Size: {file.size if hasattr(file, 'size') else 'Unknown'}")
    print(f"🎨 Content-Type: {file.content_type}")
    
    if not file.content_type.startswith("image/"):
        
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read image
    content = await file.read()
    img = pil_from_bytes(content)
    img_array = np.array(img)
    w, h = img.size
    t0 = time.time()

    # Generate tracking code
    if not tracking_code:
        date_str = datetime.utcnow().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:8].upper()
        tracking_code = f"PKG-{date_str}-{unique_id}"
    
    print(f"📦 Tracking Code: {tracking_code}")

    # STEP 1: Upload original to S3
    orig_s3_url = None
    orig_s3_key = None
    
    if os.getenv("S3_BUCKET_NAME"):
        try:
            orig_s3_key = storage.generate_s3_key(os.getenv("S3_BUCKET_NAME"),'uploads',file.filename)
            orig_s3_url = storage.upload_bytes_to_s3(orig_s3_key, content, file.content_type)
            print(f"☁️  Original uploaded to S3: {orig_s3_key}")
        except Exception as e:
            print(f"⚠️  S3 upload failed: {e}")

    # STEP 2: Run YOLO detection
    print("\n🤖 Running YOLO detection...")
    preds = predict_pil_image(
        img, 
        imgsz=int(os.getenv("IMG_SZ", 640)), 
        conf=float(os.getenv("CONF_THRESH", 0.25))
    )
    print(f"✅ Found {len(preds)} detections")

    # Determine status - only count actual damage detections
    damage_preds = [p for p in preds if p['class_name'].lower() not in ['no_damage', 'none', 'normal', 'good', 'clean', 'undamaged']]
    
    package_status = "passed"
    primary_severity = "secondary"
    primary_damage_type = "None"
    max_confidence = 0.0
    
    if len(damage_preds) > 0:
        top_pred = max(damage_preds, key=lambda p: p['score'])
        max_confidence = top_pred['score']
        primary_damage_type = top_pred['class_name']
        
        if max_confidence >= 0.4:
            package_status = "damaged"
        
        primary_severity, _, _ = get_severity_and_color(max_confidence)

    all_damage_types = list(set(p['class_name'] for p in damage_preds)) if damage_preds else ["None"]
    damage_type_str = ", ".join(all_damage_types)

    print(f"\n📊 Analysis:")
    print(f"   Status: {package_status}")
    print(f"   Severity: {primary_severity}")
    print(f"   Damages: {damage_type_str}")
    print(f"   Confidence: {max_confidence*100:.1f}%")

    # STEP 3 & 4: Save to database
    package_id = None
    image_id = None
    
    if os.getenv("POSTGRES_DSN"):
        try:
            print("\n💾 Saving to database...")
            
            package_id = await pg.insert_package(
                tracking_code, 
                package_status, 
                primary_severity, 
                damage_type_str,
                max_confidence,
                datetime.utcnow(),
                None,  # inspector_id
                f"Detected by {current_user['username']}"
            )
            print(f"✅ Package saved (ID: {package_id})")
            
            # Save image (we'll update with other URLs later)
            image_id = await pg.insert_image(
                package_id, 
                orig_s3_url,
                orig_s3_key
            )
            print(f"✅ Image saved (ID: {image_id})")
            
        except Exception as e:
            print(f"❌ Database error: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("\n⚠️  Skipping database save - POSTGRES_DSN not configured")

    # STEP 5: Process predictions and upload crops - only process actual damages
    boxes_for_explainability = []
    processed_preds = []
    
    print("\n🎯 Processing predictions...")
    
    for i, p in enumerate(damage_preds):
        x1, y1, x2, y2 = [int(v) for v in p['bbox']]
        score = p['score']
        class_name = p['class_name']
        class_id = p.get('class_id', 0)
        
        severity, hex_color, bgr_color = get_severity_and_color(score)
        boxes_for_explainability.append([x1, y1, x2, y2, score])
        
        # Upload crop to S3
        crop_s3_url = None
        crop_s3_key = None
        
        if os.getenv("S3_BUCKET_NAME"):
            try:
                crop_img = img_array[y1:y2, x1:x2]
                _, crop_buffer = cv2.imencode('.jpg', crop_img)
                
                crop_filename = f"{class_name}_{i+1}.jpg"
                crop_s3_key = storage.generate_s3_key(os.getenv("S3_BUCKET_NAME"), 'crops', f"{tracking_code}_{crop_filename}")
                crop_s3_url = storage.upload_bytes_to_s3(
                    crop_s3_key, 
                    crop_buffer.tobytes(), 
                    "image/jpeg"
                )
                print(f"   ☁️  Crop {i+1}: {class_name}")
            except Exception as e:
                print(f"   ⚠️  Crop upload failed: {e}")

        # Save prediction to database
        if os.getenv("POSTGRES_DSN") and image_id:
            try:
                pred_id = f"PRED-{tracking_code}-{i+1:03d}"
                damage_detected = class_name.lower() not in ['no_damage', 'none', 'normal', 'good']
                
                # Direct insert with all fields
                pool = await pg.init_pool()
                prediction_id = await pool.fetchval("""
                    INSERT INTO predictions (
                        image_id, pred_id, class_id, class_name, 
                        score, confidence, x1, y1, x2, y2, 
                        crop_s3_url, crop_s3_key, 
                        damage_detected, damage_type, created_at
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                    RETURNING id
                """, 
                    image_id, pred_id, class_id, class_name,
                    score, score, x1, y1, x2, y2,
                    crop_s3_url, crop_s3_key,
                    damage_detected, class_name
                )
                
                print(f"   ✅ DB SAVED - ID: {prediction_id} | {class_name} ({score*100:.1f}%)")
                
            except Exception as e:
                print(f"   ❌ DB ERROR: {e}")
                import traceback
                traceback.print_exc()
        
        processed_preds.append({
            'id': i + 1,
            'class_name': class_name,
            'score': score,
            'bbox': [x1, y1, x2, y2],
            'severity': severity,
            'color': hex_color,
            'dimensions': f"{x2-x1}x{y2-y1}px",
            'crop_url': crop_s3_url
        })

    # STEP 6: Generate annotated image
    print("\n🎨 Generating visualizations...")
    if len(damage_preds) > 0:
        annotated = draw_detections_on_image(img_array, processed_preds)
    else:
        # For clean packages, draw a green verification box
        annotated = img_array.copy()
        h, w = annotated.shape[:2]
        # Draw green border around entire image
        cv2.rectangle(annotated, (10, 10), (w-10, h-10), (136, 255, 0), 8)
        # Add "UNDAMAGED" text
        font = cv2.FONT_HERSHEY_SIMPLEX
        text = "UNDAMAGED"
        (text_width, text_height), _ = cv2.getTextSize(text, font, 1.0, 2)
        x = (w - text_width) // 2
        y = text_height + 30
        cv2.rectangle(annotated, (x-15, y-text_height-10), (x+text_width+15, y+8), (136, 255, 0), -1)
        cv2.putText(annotated, text, (x, y), font, 1.0, (0, 0, 0), 2)
    
    annotated_base64 = image_to_base64(annotated)

    # Upload annotated to S3
    annotated_s3_url = None
    annotated_s3_key = None
    
    if os.getenv("S3_BUCKET_NAME"):
        try:
            _, ann_buffer = cv2.imencode('.jpg', annotated)
            annotated_s3_key = storage.generate_s3_key(os.getenv("S3_BUCKET_NAME"),
    'annotated',
    f"{tracking_code}_annotated.jpg")
            annotated_s3_url = storage.upload_bytes_to_s3(
                annotated_s3_key, 
                ann_buffer.tobytes(), 
                "image/jpeg"
            )
            print(f"☁️  Annotated uploaded")
        except Exception as e:
            print(f"⚠️  Annotated upload failed: {e}")

    # STEP 7 & 8: Generate explainability (GradCAM + SHAP)
    gradcam_url = None
    gradcam_s3_url = None
    gradcam_s3_key = None
    shap_url = None
    shap_s3_url = None
    shap_s3_key = None
    
    if len(boxes_for_explainability) > 0:
        try:
            print("🧠 Generating explainability AI...")
            
            # Generate GradCAM
            gradcam_img = generate_gradcam_heatmap(img_array, np.array(boxes_for_explainability))
            gradcam_url = image_to_base64(gradcam_img)
            
            # Upload GradCAM to S3
            if os.getenv("S3_BUCKET_NAME"):
                _, grad_buffer = cv2.imencode('.jpg', gradcam_img)
                gradcam_s3_key = storage.generate_s3_key( os.getenv("S3_BUCKET_NAME"),
    'explainability',  # Use explainability folder
    f"{tracking_code}_gradcam.jpg")
                gradcam_s3_url = storage.upload_bytes_to_s3(
                    gradcam_s3_key, 
                    grad_buffer.tobytes(), 
                    "image/jpeg"
                )
                print("☁️  GradCAM uploaded")
            
            # Generate SHAP
            shap_img = generate_shap_explanation(img_array, np.array(boxes_for_explainability))
            shap_url = image_to_base64(shap_img)
            
            # Upload SHAP to S3
            if os.getenv("S3_BUCKET_NAME"):
                _, shap_buffer = cv2.imencode('.jpg', shap_img)
                shap_s3_key = storage.generate_s3_key( os.getenv("S3_BUCKET_NAME"),
    'explainability',  # Use explainability folder
    f"{tracking_code}_shap.jpg")
                shap_s3_url = storage.upload_bytes_to_s3(
                    shap_s3_key, 
                    shap_buffer.tobytes(), 
                    "image/jpeg"
                )
                print("☁️  SHAP uploaded")
            
            print("✅ Explainability AI complete")
            
        except Exception as e:
            print(f"⚠️  Explainability error: {e}")

    # Update database with all URLs
    if image_id:
        try:
            await pg.update_image_urls(
                image_id,
                annotated_s3_url, annotated_s3_key,
                gradcam_s3_url, gradcam_s3_key,
                shap_s3_url, shap_s3_key
            )
            print("✅ Database updated with all URLs")
        except Exception as e:
            print(f"⚠️  URL update failed: {e}")

    inference_time = int((time.time() - t0) * 1000)

    # Severity counts
    severity_counts = {
        'severe': sum(1 for p in processed_preds if p['severity'] == 'danger'),
        'moderate': sum(1 for p in processed_preds if p['severity'] == 'warning'),
        'minor': sum(1 for p in processed_preds if p['severity'] == 'secondary')
    }

    print(f"\n⏱️  Total time: {inference_time}ms")
    print("="*80 + "\n")

    return {
        'success': True,
        'package_id': package_id,
        'tracking_code': tracking_code,
        'status': package_status,
        'detections': processed_preds,
        'total_damages': len(damage_preds),
        'severity_counts': severity_counts,
        'annotated_image_url': annotated_base64,
        'original_s3_url': orig_s3_url,
        'annotated_s3_url': annotated_s3_url,
        'gradcam_url': gradcam_url,
        'gradcam_s3_url': gradcam_s3_url,
        'shap_url': shap_url,
        'shap_s3_url': shap_s3_url,
        'image_width': w,
        'image_height': h,
        'inference_time_ms': inference_time,
        'timestamp': datetime.utcnow().isoformat(),
        'inspector': current_user['username']
    }

# ============================================================================
# DASHBOARD ENDPOINTS
# ============================================================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_active_user)):
    """Get dashboard statistics from database"""
    
    if not os.getenv("POSTGRES_DSN"):
        return {
            'total_packages_today': 0,
            'total_inspections': 0,
            'total_damages_today': 0,
            'total_damages': 0,
            'most_common_damage': 'None',
            'damage_rate': 0,
            'detection_accuracy': 0,
            'damage_breakdown': {'crushed': 0, 'torn': 0, 'dented': 0, 'wet': 0, 'other': 0},
            'recent_detections': []
        }
    
    try:
        stats = await pg.get_dashboard_stats()
        return stats
        
    except Exception as e:
        print(f"❌ Dashboard stats error: {e}")
        return {
            'total_packages_today': 0,
            'total_inspections': 0,
            'total_damages_today': 0,
            'total_damages': 0,
            'most_common_damage': 'None',
            'damage_rate': 0,
            'detection_accuracy': 0,
            'damage_breakdown': {'crushed': 0, 'torn': 0, 'dented': 0, 'wet': 0, 'other': 0},
            'recent_detections': []
        }

@app.get("/api/analytics")
async def get_analytics_data(current_user: dict = Depends(get_current_active_user)):
    """Get comprehensive analytics data"""
    
    if not os.getenv("POSTGRES_DSN"):
        return {
            'accuracy_trend': [],
            'hourly_stats': []
        }
    
    try:
        analytics = await pg.get_analytics_data()
        return analytics
        
    except Exception as e:
        print(f"❌ Analytics error: {e}")
        return {
            'accuracy_trend': [],
            'hourly_stats': []
        }

@app.get("/api/packages/all")
async def get_all_packages(current_user: dict = Depends(get_current_active_user)):
    """Get all packages for inspection queue"""
    
    if not os.getenv("POSTGRES_DSN"):
        return {'packages': []}
    
    try:
        pool = await pg.init_pool()
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
        """)
        
        packages = [
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
        
        return {'packages': packages}
        
    except Exception as e:
        print(f"❌ Failed to get all packages: {e}")
        return {'packages': []}

@app.get("/api/packages/{tracking_code}")
async def get_package(
    tracking_code: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Get package details by tracking code"""
    
    if not os.getenv("POSTGRES_DSN"):
        raise HTTPException(status_code=503, detail="Database not configured")
    
    try:
        package = await pg.get_package_by_tracking_code(tracking_code)
        
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        pool = await pg.init_pool()
        
        images = await pool.fetch("""
            SELECT * FROM inspection_images WHERE package_id = $1
        """, package['package_id'])
        
        predictions = []
        for img in images:
            preds = await pool.fetch("""
                SELECT * FROM predictions WHERE image_id = $1
            """, img['image_id'])
            predictions.extend([dict(p) for p in preds])
        
        return {
            'package': dict(package),
            'images': [dict(img) for img in images],
            'predictions': predictions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/images/{s3_key:path}")
async def serve_image(s3_key: str, token: str = None):
    """Serve images from S3 with token authentication"""
    try:
        # Verify token
        if token:
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                username: str = payload.get("sub")
                if username is None:
                    raise HTTPException(status_code=401, detail="Invalid token")
            except JWTError:
                raise HTTPException(status_code=401, detail="Invalid token")
        else:
            raise HTTPException(status_code=401, detail="Token required")
        
        from services import storage
        
        # Download image from S3
        bucket_name = os.getenv("S3_BUCKET_NAME")
        if not bucket_name:
            raise HTTPException(status_code=503, detail="S3 not configured")
        
        image_data = storage.download_from_s3(bucket_name, s3_key)
        
        # Determine content type
        content_type = "image/jpeg"
        if s3_key.lower().endswith('.png'):
            content_type = "image/png"
        elif s3_key.lower().endswith('.gif'):
            content_type = "image/gif"
        
        from fastapi.responses import Response
        return Response(content=image_data, media_type=content_type)
        
    except Exception as e:
        print(f"❌ Failed to serve image {s3_key}: {e}")
        raise HTTPException(status_code=404, detail="Image not found")

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'database': 'connected' if os.getenv("POSTGRES_DSN") else 'not configured',
        's3': 'configured' if os.getenv("S3_BUCKET_NAME") else 'not configured',
        'model': 'loaded',
        'user': 'RakshaRajkumar14',
        'database_name': 'IUProjectLocal',
        's3_bucket': os.getenv("S3_BUCKET_NAME", "not configured"),
        's3_region': os.getenv("AWS_REGION", "not configured"),
        'features': [
            'YOLO Detection',
            'GradCAM Explainability',
            'SHAP Analysis',
            'JWT Authentication',
            'PostgreSQL Storage',
            'AWS S3 Storage'
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)