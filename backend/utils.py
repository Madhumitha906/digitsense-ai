"""
utils.py
--------
Robust image preprocessing for CNN digit prediction.
Outputs:
  - Preprocessed numpy array (1, 28, 28, 1) for CNN input
  - Base64-encoded PNG of the 28x28 preprocessed image for frontend preview
"""

import io
import base64
import numpy as np
import cv2
from PIL import Image

def preprocess_image(file_bytes: bytes):
    """
    Preprocess uploaded image using OpenCV.
    
    Pipeline:
        1. RGB conversion
        2. Grayscale & Gaussian blur
        3. Adaptive thresholding (Otsu-like robustness)
        4. Auto-invert (make digit white, background black)
        5. Detect largest contour (bounding box)
        6. Pad and resize to 28x28
        7. Normalize to [0,1]
    """
    # Load via Pillow to handle assorted formats easily, then to numpy
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    arr = np.array(img)

    # 1. Grayscale
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)

    # 2. Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # 3. OTSU thresholding (binary inverse)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    thresh_arr = np.array(thresh, dtype=np.uint8)

    # 4. Auto-invert to ensure black background and white digit
    white_ratio = np.sum(thresh_arr == 255) / float(thresh_arr.size)
    if white_ratio > 0.5:
        thresh_arr = 255 - thresh_arr

    # Apply dilation to make digit thicker
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(thresh_arr, kernel, iterations=1)

    # 5. Extract largest contour
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(c)
        cropped = dilated[y:y+h, x:x+w]
        h, w = int(h), int(w)
    else:
        cropped = dilated
        h, w = int(cropped.shape[0]), int(cropped.shape[1])

    # 6. Resize to 20x20 and pad to 28x28 (Exact MNIST standard)
    size = max(h, w, 1)
    scale = 20.0 / size
    new_w = max(int(w * scale), 1)
    new_h = max(int(h * scale), 1)
    
    resized_20 = cv2.resize(cropped, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Pad to 28x28
    padded = np.zeros((28, 28), dtype=np.uint8)
    y_off = (28 - new_h) // 2
    x_off = (28 - new_w) // 2
    padded[y_off:y_off+new_h, x_off:x_off+new_w] = resized_20

    # 7. Normalize pixel values
    final_norm = padded.astype(np.float32) / 255.0
    img_array = final_norm.reshape(1, 28, 28, 1)

    # Preview PNG
    preview_pil = Image.fromarray(padded)
    buf = io.BytesIO()
    preview_pil.save(buf, format="PNG")
    preview_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return img_array, preview_b64

