"""
train_script.py
---------------
Standalone script to train the CNN model manually.
Run this script once to generate model.h5 before starting the server.
"""
from model import train_model

if __name__ == "__main__":
    print("🚀 Starting manual model training...")
    try:
        train_model()
        print("✅ Training successfully completed. 'model.h5' has been saved.")
        print("You can now start or restart the backend server.")
    except Exception as e:
        print(f"❌ Error during training: {e}")
