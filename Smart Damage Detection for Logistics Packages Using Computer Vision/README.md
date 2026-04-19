# Smart Damage Detection for Logistics Packages Using Computer Vision
Millions of packages are handled every day in contemporary logistics and e-commerce operations and preserving customer satisfaction and operational effectiveness depend on their safe delivery. Most damage detection are done through manual visual checks which takes lot of time, inconsistent, and human error prone. Existing automated systems such as barcode scanners and simple image recognition software, can identify packages, but not precisely identify, classify, or report damage.  This project proposes a smart AI-based computer vision system that can automatically identify and classify package damage in real time. The system will be founded on deep learning as Convolutional Neural Networks (CNNs), which will be enhanced with Explainable AI (XAI) techniques such as GRAD-CAM and SHAP that highlight impacted locations and provide interpretable justification for each prediction. By integrating transparency and trust into AI-powered inspection, the system aims to reduce human workload, decrease financial losses due to misclassified damage, and enhance overall logistics efficiency. The expected result is a smart, transparent, and efficient damage detection system that significantly reduces the efforts of manual inspection, improves accuracy in damage assessment, and maximizes customer satisfaction as well as maximizes the logistics operation while minimizing the financial losses from damaged products.


## 📌 **Features**

* **Real-time damage detection** (Dent, Tear, Scratch, Wet, Crushed, Undamaged)
* **YOLOv8-based object detection**
* **Explainability with Grad-CAM & SHAP** (heatmaps + feature contributions)
* **FastAPI high-performance backend**
* **Modern Angular dashboard with visual overlays**
* **Severity scoring (Minor / Moderate / Severe / Critical)**
* **AWS S3 storage for images & explainability outputs**
* **PostgreSQL database for inspection metadata**
* **Auto-generated PDF inspection reports**
* **Confusion matrix, training visualization, performance metrics**
* **Supports image upload, preview, detection, and report download**

---

## 🎯 **Project Goals**

* Build an automated deep learning system to accurately detect and classify package damage.
* Provide real-time bounding boxes, severity levels, and confidence scores.
* Integrate explainable AI (Grad-CAM, SHAP) to enhance model transparency.
* Reduce manual inspection time and human inconsistency.
* Enhance logistics quality control using an intelligent, reliable inspection platform.
* Deploy a full-stack solution with scalable cloud storage and database support.

---

## 🏗️ **System Architecture**

The system follows a 4-layer architectural design:

### **1️⃣ Image Processing Pipeline**

* Warehouse images → annotation via Roboflow
* Augmented dataset for robust model training
* Trained YOLOv8 model (.pt file)

### **2️⃣ AI Component Layer**

* **YOLOv8 Object Detection Engine**

  * Outputs bounding boxes, class labels, confidence, severity
* **Explainability Module**

  * Grad-CAM heatmaps
  * SHAP feature importance visualizations

### **3️⃣ Backend Layer**

* FastAPI inference endpoint
* Severity calculator
* Explainability generator
* PostgreSQL + AWS S3 integration
* PDF report generator

### **4️⃣ Frontend Layer (Angular)**

* Image upload
* Detection dashboard
* Damage breakdown panel
* Explainability viewer
* Report download

---

## 🧠 **Technical Stack**

| Component            | Technologies                 |
| -------------------- | ---------------------------- |
| **Damage Detection** | Ultralytics YOLOv8 (PyTorch) |
| **Explainable AI**   | Grad-CAM, SHAP               |
| **Image Processing** | OpenCV, Pillow               |
| **Backend API**      | FastAPI (Python), Uvicorn    |
| **Frontend**         | Angular 17+, TypeScript      |
| **Database**         | PostgreSQL                   |
| **Cloud Storage**    | AWS S3                       |
| **Model Training**   | Roboflow, PyTorch, YOLO CLI  |
| **Deployment**       | Docker, Render / AWS EC2     |
| **Version Control**  | Git & GitHub                 |

---

## 📂 **Project Structure**

```
Smart Damage Detection for Logistics Packages Using Computer Vision
 ┣ backend/                                # Backend implementation
 ┣ frontend/                               # Frotend implementation
 ┣ Damage-Detection-for-Packages-1         # Training/validation data -1
 ┣ data                                    # Data used for project
 ┣ runs                                    # YOLOv8 trained model
 ┣ yolov8n.pt                              # Pre-trained model
 ┣ README.md          
 ┣ docs                                    # Documents
```
## **Damage Severity Classification**

Severity is derived from:

* Base severity weight per class
* Bounding box area
* Confidence score
* Area-to-image ratio

Thresholds:

* **Minor** < 30
* **Moderate** 30–60
* **High** 60–85
* **Critical** > 85

---

## **Explainable AI (XAI)**

**Grad-CAM**

* Heatmaps showing which regions influenced YOLO predictions.

**SHAP**

* Quantitative feature contribution scores.

These improve trust, operator understanding, and model transparency.

---

## 🧪 **Testing Summary**

| Test Case | Description                 | Result   |
| --------- | --------------------------- | -------- |
| TC01      | Upload valid image          | ✔ Passed |
| TC02      | Detect multiple damages     | ✔ Passed |
| TC03      | No damage detected          | ✔ Passed |
| TC04      | Grad-CAM heatmap generated  | ✔ Passed |
| TC05      | SHAP explanation generated  | ✔ Passed |
| TC06      | Save metadata to PostgreSQL | ✔ Passed |
| TC07      | Upload to AWS S3            | ✔ Passed |



---

# **Project Risks and Mitigation**

### **1️⃣ Limited Dataset Diversity**

**Risk:** Sparse real warehouse images cause weaker generalization.
**Mitigation:** Applied dataset augmentation (cropping, flips, noise, brightness adjustments).

### **2️⃣ Similar Damage Classes Confusing the Model**

**Risk:** Dent, tear, and crushed look visually similar → misclassifications.
**Mitigation:** Re-annotated ambiguous samples, increased variation, tuned confidence thresholds.

### **3️⃣ Model Generalization Challenges**

**Risk:** Variability in lighting, angles, and textures affect accuracy.
**Mitigation:** Multi-stage dataset refinement, augmentation, and validation cycles.

### **4️⃣ Explainability Complexity**

**Risk:** Generating meaningful Grad-CAM & SHAP maps for object detection is non-trivial.
**Mitigation:** Added preprocessing, layer selection, and GPU-based explainability modules.

### **5️⃣ Privacy & Compliance**

**Risk:** Warehouse images may include people or sensitive items.
**Mitigation:** No personal data stored; only package regions are saved.

### **6️⃣ Operational Impact**

**Risk:** False positives may lead to unnecessary repackaging or delays.
**Mitigation:** Severity scoring + SHAP explanations to validate decisions.

---

## 📅 **Project Phase Status**

| Phase                      | Status        |
| -------------------------- | --------------|
| **Phase 1 — Conception**   | ✅ Completed  |
| **Phase 2 — Development**  | ✅ Completed  |
| **Phase 3 — Finalization** | ✅ Completed  |

---

## **How to Run the Project**
### **Clone the Repository**
```bash
git clone https://github.com/RakshaRajkumar14/IU_Project-Raksha_Rajkumar_Kademani.git
cd Smart Damage Detection for Logistics Packages Using Computer Vision
```

### **Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### **Frontend**

```bash
cd frontend
npm install
ng serve --open
```

Upload → Detect → View Damage → Download Report

---

## 🧑‍💻 **Author**

**Raksha Rajkumar Kademani**
MS in Computer Science, IU International University of Applied Sciences, Berlin
