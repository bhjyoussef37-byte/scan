import torch
import sys
import os

# The monkey-patch I applied to camera.py
original_load = torch.load
def patched_load(*args, **kwargs):
    if 'weights_only' not in kwargs:
        kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

try:
    from ultralytics import YOLO
    print("Loading model...")
    # Try to load the model just like camera.py does
    model = YOLO("best.pt", task='detect')
    print("SUCCESS: Model loaded without weights_only error.")
except Exception as e:
    print(f"FAILED: {e}")
