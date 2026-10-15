# Scene Classifier API (backend)

FastAPI service for the ResNet50 scene classifier (Intel Image Classification, 6 classes).

## Layout
```
app/
  main.py                 app, CORS, model loaded once at startup
  api/routes.py           /health, /model-info, /predict
  core/config.py          settings (env overridable)
  core/calibration.py     temperature scaling (NumPy only)
  core/layers.py          BackbonePreprocess custom layer (needed to load the model)
  schemas/prediction.py   request/response models
  services/model_service.py  load model, preprocess, predict, uncertain rule
models/                   put the 3 files from the notebook export here
tests/                    calibration unit tests, API tests, notebook consistency test
```

## Setup
1. Unzip `seker_project04_final.zip` and copy `resnet50_inference.keras`, `model_config.json`
   and `temperature.json` into `models/`.
2. `python -m venv .venv && source .venv/bin/activate` (Windows: `.venv\Scripts\activate`)
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload --port 8000`
5. Docs: http://localhost:8000/docs

## Test
`pytest -q`

## Endpoint
`POST /api/v1/predict` (multipart, field `file`) returns the class, calibrated confidence,
top 3, all probabilities and `outcome` = class or `"uncertain"` (confidence below 0.70).
# image-classification
