# VietTraffic Local AI Service

This service runs a trained Ultralytics YOLO model locally and exposes image
inference through FastAPI.

## Setup

From the `ai_service` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

The default configuration uses the trained model at
`..\runs\detect\traffic-baseline\weights\best.pt`. To use another model, set
`MODEL_PATH` to a path relative to this directory.

```powershell
uvicorn main:app --host 127.0.0.1 --port 8000
```

The dataset configuration is at `C:\duan\dataset\data.yaml`. It currently has
one class (`traffic-objects`), so it can validate the pipeline but cannot
reliably distinguish vehicle types or traffic violations.

Endpoints:

- `GET /health`
- `POST /predict/image` with an image multipart field named `file`

The API deliberately returns `503` when the model is missing instead of
returning simulated detections.
