"""
main.py
-------
FastAPI backend for MNIST CNN Digit Recognition.

Endpoints:
    GET  /          - Health check
    GET  /status    - Model training status + accuracy
    POST /predict   - Accept image upload, return prediction + confidence + 28x28 preview
"""

import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from model import load_model_from_disk, MODEL_PATH
from utils import preprocess_image

# Global variables to hold the loaded model and accuracy in memory
app_data = {
    "model": None,
    "accuracy": None
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- NO AUTO-TRAINING ON STARTUP ---
    print("--- Starting DigitSense Backend ---")
    if os.path.exists(MODEL_PATH):
        print("Loading model...")
        model, acc, _ = load_model_from_disk()
        app_data["model"] = model
        app_data["accuracy"] = acc
        print("Model loaded successfully")
    else:
        print("Model not found. Please run train_script.py")

    yield
    # Shutdown logic (if any)
    print("--- Shutting down DigitSense ---")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="MNIST Digit Recognition API (CNN)",
    description="Upload or draw a handwritten digit — CNN predicts it with confidence score.",
    version="3.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://digitsense-ai-2pvq.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {"message": "MNIST CNN Digit Recognition API is running 🚀"}


@app.get("/status", tags=["Model"])
def status():
    """Return model status and accuracy (called by frontend to know we're online)."""
    if app_data["model"] is not None:
        return {"model_trained": True, "accuracy": app_data["accuracy"]}
    return {"model_trained": False, "accuracy": None}


@app.post("/predict", tags=["Prediction"])
async def predict(file: UploadFile = File(...)):
    """
    Predict the digit in an uploaded image using the auto-loaded CNN.
    """
    model = app_data["model"]
    accuracy = app_data["accuracy"]

    if model is None:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": "Model not available. Please run train_script.py"
            }
        )

    allowed_types = {
        "image/png", "image/jpeg", "image/jpg",
        "image/bmp", "image/gif", "image/webp",
    }
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Upload PNG/JPG.",
        )

    try:
        file_bytes = await file.read()

        # Preprocess: returns (1,28,28,1) + base64 preview
        img_array, preview_b64 = preprocess_image(file_bytes)

        # Predict directly using loaded model memory instance
        probs = model.predict(img_array, verbose=0)[0]
        predicted_digit = int(probs.argmax())
        confidence = float(probs.max())

        return {
            "predicted_digit": predicted_digit,
            "confidence": round(float(confidence), 4),
            "probabilities": [round(float(p), 4) for p in probs],
            "accuracy": round(float(accuracy), 4) if accuracy else 0.0,
            "processed_image": preview_b64,          # base64 PNG
            "low_confidence": float(confidence) < 0.80,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
