"""
model.py
--------
CNN model for MNIST digit recognition using TensorFlow/Keras.

Architecture:
    Input (28x28x1)
    → Conv2D(32, 3x3, relu) → BatchNorm → MaxPool → Dropout(0.25)
    → Conv2D(64, 3x3, relu) → BatchNorm → MaxPool → Dropout(0.25)
    → Flatten → Dense(256, relu) → Dropout(0.5)
    → Dense(10, softmax)

Training uses ImageDataGenerator for data augmentation:
    - Rotation ±15°
    - Width/Height shift ±10%
    - Zoom ±10%
    - Gaussian noise added manually
"""

import os
import glob
import numpy as np
import cv2
import json

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # suppress TF info & warning logs


from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import confusion_matrix, accuracy_score
from utils import preprocess_image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.h5")
META_PATH  = os.path.join(os.path.dirname(__file__), "model_meta.json")
CUSTOM_DATA_PATH = os.path.join(os.path.dirname(__file__), "custom_data")


# ---------------------------------------------------------------------------
# Build CNN
# ---------------------------------------------------------------------------

def build_cnn() -> keras.Model:
    """Build and compile the CNN classifier."""
    model = keras.Sequential([
        # ── Block 1 ──────────────────────────────────────────────────
        layers.Input(shape=(28, 28, 1)),
        layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── Block 2 ──────────────────────────────────────────────────
        layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── Classifier ───────────────────────────────────────────────
        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(10, activation="softmax"),
    ], name="digit_cnn")

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


# ---------------------------------------------------------------------------
# Train
# ---------------------------------------------------------------------------

def load_custom_data():
    """Load user-provided custom digit images from backend/custom_data/."""
    X_custom, y_custom = [], []
    if os.path.exists(CUSTOM_DATA_PATH):
        for digit in range(10):
            folder = os.path.join(CUSTOM_DATA_PATH, str(digit))
            if os.path.exists(folder):
                for filepath in glob.glob(os.path.join(folder, "*.*")):
                    try:
                        with open(filepath, "rb") as f:
                            img_array, _ = preprocess_image(f.read())
                        X_custom.append(img_array[0])  # Extract from (1, 28, 28, 1)
                        y_custom.append(digit)
                    except Exception as e:
                        print(f"Failed to load custom image {filepath}: {e}")
    
    if X_custom:
        print(f"Loaded {len(X_custom)} custom images for training!")
        return np.array(X_custom), np.array(y_custom)
    return np.array([]), np.array([])


def train_model() -> dict:
    """
    Train CNN on augmented MNIST data, save model + metadata to disk.

    Returns:
        dict: { "accuracy": float, "confusion_matrix": list[list[int]] }
    """
    print("Loading MNIST dataset...")
    (X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()

    # Normalize to [0, 1] and reshape to (N, 28, 28, 1)
    X_train = X_train.astype("float32") / 255.0
    X_test  = X_test.astype("float32")  / 255.0

    # ----------- DATA AUGMENTATION -----------
    # Add Gaussian noise
    noise = np.random.normal(0, 0.05, X_train.shape).astype("float32")
    X_train_noisy = np.clip(X_train + noise, 0.0, 1.0)

    # Add Gaussian blur
    X_train_blurred = np.zeros_like(X_train)
    for i in range(len(X_train)):
        blurred = cv2.GaussianBlur(X_train[i], (5, 5), 0)
        X_train_blurred[i] = blurred

    X_train_res = X_train[..., np.newaxis]
    X_train_noisy_res = X_train_noisy[..., np.newaxis]
    X_train_blurred_res = X_train_blurred[..., np.newaxis]
    X_test      = X_test[..., np.newaxis]

    # Combine clean + noisy + blurred for a richer training set
    X_all  = np.concatenate([X_train_res, X_train_noisy_res, X_train_blurred_res], axis=0)
    y_all  = np.concatenate([y_train, y_train, y_train], axis=0)

    # ----------- CUSTOM DATA -----------
    X_custom, y_custom = load_custom_data()
    if len(X_custom) > 0:
        # Augment custom data specifically so it acts as a strong prior
        noise_custom = np.random.normal(0, 0.05, X_custom.shape).astype("float32")
        X_custom_noisy = np.clip(X_custom + noise_custom, 0.0, 1.0)
        X_all = np.concatenate([X_all, X_custom, X_custom_noisy], axis=0)
        y_all = np.concatenate([y_all, y_custom, y_custom], axis=0)


    print(f"Training set: {X_all.shape[0]} samples (incl. augmented) | Test: {X_test.shape[0]}")

    # ImageDataGenerator: geometric augmentations
    datagen = ImageDataGenerator(
        rotation_range=15,
        width_shift_range=0.10,
        height_shift_range=0.10,
        zoom_range=0.10,
        fill_mode="nearest",
    )
    datagen.fit(X_all)

    model = build_cnn()
    model.summary()

    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=4, restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=2, min_lr=1e-5
        ),
    ]

    print("Training CNN...")
    model.fit(
        datagen.flow(X_all, y_all, batch_size=128),
        steps_per_epoch=len(X_all) // 128,
        epochs=1,
        validation_data=(X_test, y_test),
        callbacks=callbacks,
        verbose=1,
    )

    # Evaluate
    y_pred_probs = model.predict(X_test, verbose=0)
    y_pred = np.argmax(y_pred_probs, axis=1)
    acc = accuracy_score(y_test, y_pred)
    cm  = confusion_matrix(y_test, y_pred)

    print(f"Test Accuracy: {acc * 100:.2f}%")

    # Save model and metadata
    model.save(MODEL_PATH)
    meta = {"accuracy": round(float(acc), 4), "confusion_matrix": cm.tolist()}
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f)

    print(f"Model saved -> {MODEL_PATH}")
    return meta


# ---------------------------------------------------------------------------
# Load / Status
# ---------------------------------------------------------------------------

def load_model_from_disk():
    """Load saved CNN model + metadata."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Model not found. Call POST /train first."
        )
    model = keras.models.load_model(MODEL_PATH)
    with open(META_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)
    return model, meta["accuracy"], meta.get("confusion_matrix")


def is_model_trained() -> bool:
    """Returns True if a saved model file exists."""
    return os.path.exists(MODEL_PATH)
