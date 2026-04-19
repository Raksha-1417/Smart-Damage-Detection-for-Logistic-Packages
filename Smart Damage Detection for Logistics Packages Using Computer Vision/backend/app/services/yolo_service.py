# backend/app/services/yolo_service.py
import os
from typing import List, Dict
from PIL import Image
from ultralytics import YOLO

YOLO_WEIGHTS = os.getenv("YOLO_WEIGHTS", "models/best.pt")
detector = None

def init_model():
    global detector
    if detector is not None:
        return
    try:
        print("Loading YOLO model from:", YOLO_WEIGHTS)
        detector = YOLO(YOLO_WEIGHTS)
        print("YOLO loaded. classes:", getattr(detector.model, "names", None))
    except Exception as e:
        print("Failed to load YOLO model:", e)
        detector = None

def predict_pil_image(img: Image.Image, imgsz: int = 640, conf: float = 0.25) -> List[Dict]:
    """
    Returns a list of dicts:
      { id, class_id, class_name, score, bbox: [x1,y1,x2,y2] }
    """
    global detector
    if detector is None:
        # no model loaded
        print("predict called but detector is None")
        return []

    # ultralytics returns a Results object or list of Results
    results = detector.predict(img, imgsz=imgsz, conf=conf, device='cpu')  # use cpu unless gpu available

    out = []
    for r in results:
        boxes = getattr(r, "boxes", None)
        if boxes is None:
            continue
        for i, b in enumerate(boxes):
            # extract xyxy, conf, cls robustly
            try:
                xyxy = b.xyxy.tolist()[0] if hasattr(b.xyxy, "tolist") else [float(x) for x in b.xyxy]
            except Exception:
                # fallback if xyxy is a tensor or list
                xyxy = [float(x) for x in getattr(b, "xyxy", [0,0,0,0])]
            try:
                score = float(b.conf.tolist()[0]) if hasattr(b.conf, "tolist") else float(b.conf)
            except Exception:
                score = float(getattr(b, "conf", 0.0))
            try:
                cls_id = int(b.cls.tolist()[0]) if hasattr(b.cls, "tolist") else int(b.cls)
            except Exception:
                cls_id = int(getattr(b, "cls", 0))
            class_name = detector.model.names[cls_id] if getattr(detector, "model", None) and hasattr(detector.model, "names") and cls_id in detector.model.names else str(cls_id)
            out.append({
                "id": f"{i}",
                "class_id": cls_id,
                "class_name": class_name,
                "score": score,
                "bbox": [xyxy[0], xyxy[1], xyxy[2], xyxy[3]],
            })
    print(f"predict_pil_image -> found {len(out)} preds")
    return out
