# 🔢 DigitSense AI — Handwritten Digit Recognition

A full-stack AI web application that recognizes handwritten digits (0–9) using a trained Convolutional Neural Network (CNN) with OpenCV preprocessing.

## 🏗️ Project Structure

```
machine_learning_PBL/
├── backend/
│   ├── main.py          # FastAPI server (endpoints: /predict)
│   ├── model.py         # CNN architecture & training logic
│   ├── train_script.py  # Manual script to train the CNN and save model.h5
│   ├── utils.py         # OpenCV image preprocessing (adaptive threshold, blur, bounding box crop)
│   ├── requirements.txt # Python dependencies (TensorFlow, OpenCV, FastAPI)
│   ├── custom_data/     # Folder to add your own real-world images for training
│   └── model.h5         # Saved CNN model (generated after running train_script.py)
└── frontend/
    ├── src/
    │   ├── App.jsx              # Root component with model status/train UI
    │   ├── index.css            # Global styles + animations
    │   └── components/
    │       ├── Upload.jsx       # Drag-and-drop image upload
    │       ├── Result.jsx       # Predicted digit + probability bars
    │       └── ConfusionMatrix.jsx  # 10×10 heatmap visualization
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🚀 Getting Started

### Step 1: Backend Setup

```bash
cd backend

# Create and activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies (requires TensorFlow and OpenCV)
pip install -r requirements.txt

# (Optional) Generate the model.h5 if not already present
python train_script.py

# Start FastAPI server
python -m uvicorn main:app --reload --port 8000
```

The backend API will be live at: **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will open at: **http://localhost:5173**

---

## 🧠 Using the Application

1. **Start Backend & Frontend Servers**
2. **Open** `http://localhost:5173` in your browser
3. **Upload an Image / Draw** — Drag-and-drop a photo, browse for a file, or use the drawing canvas
4. **Predict** — Click "Predict Digit" and see the result instantly

### OpenCV Preprocessing Highlights
- The backend automatically applies a Gaussian blur and adaptive thresholding to eliminate shadows.
- It detects the largest contour to crop the digit perfectly, mimicking the MNIST training structure.

---

## 🔌 API Endpoints

| Method | Endpoint   | Description                                |
|--------|------------|--------------------------------------------|
| GET    | `/`        | Health check                               |
| POST   | `/predict` | Upload image, returns predicted digit + probabilities + base64 preview |

### Example `/predict` Response
```json
{
  "predicted_digit": 7,
  "confidence": 0.9987,
  "probabilities": [0.0001, 0.0002, 0.0003, ...],
  "processed_image_b64": "iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAA...=="
}
```

---

## 🤖 Model Details

| Property              | Value                          |
|-----------------------|--------------------------------|
| Dataset               | Augmented MNIST + Custom Data  |
| Architecture          | CNN: Conv2D → MaxPool2D → Dense + Dropout |
| Optimization          | Adam Optimizer + ImageDataGenerator |
| Preprocessing         | OpenCV Adaptive Thresholding & Contour Crop |
| Model File            | `backend/model.h5`             |

---

## 📦 Backend Requirements

```
fastapi>=0.100.0
uvicorn[standard]>=0.20.0
numpy>=1.24.0
Pillow>=9.0.0
python-multipart>=0.0.6
tensorflow>=2.13.0
scikit-learn>=1.3.0
opencv-python-headless>=4.8.0
```
