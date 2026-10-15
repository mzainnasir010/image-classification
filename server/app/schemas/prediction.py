from pydantic import BaseModel, Field


class ClassScore(BaseModel):
    label: str
    probability: float = Field(ge=0, le=1)


class PredictionResponse(BaseModel):
    filename: str | None = None
    predicted_class: str = Field(description="Top class, always returned")
    confidence: float = Field(ge=0, le=1, description="Calibrated probability of the top class")
    is_uncertain: bool = Field(description="True when confidence is below the threshold")
    outcome: str = Field(description="Same as predicted_class, or 'uncertain' below the threshold")
    threshold: float
    top_predictions: list[ClassScore]
    probabilities: dict[str, float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class ModelInfoResponse(BaseModel):
    classes: list[str]
    image_size: int
    temperature: float
    uncertain_threshold: float
    test_accuracy: float | None = None
    test_macro_f1: float | None = None
