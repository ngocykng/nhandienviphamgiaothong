from __future__ import annotations

import io
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

app = FastAPI(title="VietTraffic Local AI", version="0.1.0")

MODEL_PATH = Path(os.getenv("MODEL_PATH", "../models/best.pt"))
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", "0.45"))
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "20")) * 1024 * 1024

_model: Any = None
_model_error: str | None = None


def load_model() -> Any:
    global _model, _model_error

    if _model is not None:
        return _model
    if _model_error is not None:
        raise RuntimeError(_model_error)
    if not MODEL_PATH.is_file():
        _model_error = (
            f"Model file not found: {MODEL_PATH}. "
            "Train a model and set MODEL_PATH to the resulting .pt file."
        )
        raise RuntimeError(_model_error)

    try:
        from ultralytics import YOLO

        _model = YOLO(str(MODEL_PATH))
        return _model
    except Exception as exc:
        _model_error = f"Unable to load YOLO model: {exc}"
        raise RuntimeError(_model_error) from exc


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "model_path": str(MODEL_PATH),
        "model_available": MODEL_PATH.is_file(),
        "model_loaded": _model is not None,
        "model_error": _model_error,
    }


@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Only image uploads are supported")

    payload = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds configured upload limit")

    try:
        image = Image.open(io.BytesIO(payload)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=415, detail="Uploaded file is not a valid image") from exc

    try:
        model = load_model()
        results = model.predict(
            source=image,
            conf=CONFIDENCE_THRESHOLD,
            iou=IOU_THRESHOLD,
            verbose=False,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc

    result = results[0]
    names = result.names or {}
    predictions: list[dict[str, Any]] = []
    if result.boxes is not None:
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            x1, y1, x2, y2 = (float(value) for value in box.xyxy[0].tolist())
            predictions.append(
                {
                    "x": round((x1 + x2) / 2, 2),
                    "y": round((y1 + y2) / 2, 2),
                    "width": round(x2 - x1, 2),
                    "height": round(y2 - y1, 2),
                    "class": str(names.get(class_id, class_id)),
                    "class_id": class_id,
                    "confidence": round(confidence, 4),
                }
            )

    return {
        "engine": "python_yolo_local",
        "modelId": str(MODEL_PATH),
        "image": {"width": image.width, "height": image.height},
        "predictions": predictions,
    }
