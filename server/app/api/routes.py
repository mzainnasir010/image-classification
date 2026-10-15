from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.schemas.prediction import HealthResponse, ModelInfoResponse, PredictionResponse
from app.services.model_service import InvalidImageError, model_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", model_loaded=model_service.loaded)


@router.get("/model-info", response_model=ModelInfoResponse)
def model_info():
    if not model_service.loaded:
        raise HTTPException(503, "Model is not loaded")
    cfg = model_service.config
    return ModelInfoResponse(
        classes=model_service.classes,
        image_size=model_service.image_size,
        temperature=model_service.temperature,
        uncertain_threshold=model_service.threshold,
        test_accuracy=cfg.get("test_accuracy"),
        test_macro_f1=cfg.get("test_macro_f1"),
    )


@router.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if not model_service.loaded:
        raise HTTPException(503, "Model is not loaded")
    if file.content_type not in settings.allowed_content_types:
        raise HTTPException(415, "Only JPEG, PNG or WebP images are accepted")

    data = await file.read()
    if not data:
        raise HTTPException(400, "Empty file")
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"File larger than {settings.max_upload_mb} MB")

    try:
        result = model_service.predict(data)
    except InvalidImageError as exc:
        raise HTTPException(400, str(exc)) from exc
    return PredictionResponse(filename=file.filename, **result)
