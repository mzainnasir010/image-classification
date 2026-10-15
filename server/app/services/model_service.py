import io
import json
import logging

import numpy as np
from PIL import Image, UnidentifiedImageError

from app.core.calibration import calibrate
from app.core.config import settings

logger = logging.getLogger("model_service")


class InvalidImageError(ValueError):
    """Raised when the uploaded bytes are not a readable image."""


class ModelService:
    def __init__(self) -> None:
        self.model = None
        self.config: dict = {}
        self.classes: list[str] = []
        self.image_size: int = 224
        self.temperature: float = 1.0
        self.threshold: float = 0.70

    @property
    def loaded(self) -> bool:
        return self.model is not None

    def load(self) -> None:
        # Imported here so unit tests that do not need TensorFlow stay fast.
        import tensorflow as tf

        from app.core.layers import BackbonePreprocess

        models_dir = settings.models_dir
        with open(models_dir / "model_config.json") as f:
            self.config = json.load(f)
        with open(models_dir / "temperature.json") as f:
            self.temperature = float(json.load(f)["temperature"])

        self.classes = list(self.config["classes"])
        self.image_size = int(self.config["image_size"])
        self.threshold = float(self.config["uncertain_threshold"])

        path = models_dir / self.config["model_file"]
        logger.info("Loading model from %s", path)
        self.model = tf.keras.models.load_model(
            path,
            compile=False,
            custom_objects={"BackbonePreprocess": BackbonePreprocess},
        )
        # Warm-up so the first real request is not slow
        self.model.predict(np.zeros((1, self.image_size, self.image_size, 3), "float32"), verbose=0)
        logger.info("Model ready. T=%.3f threshold=%.2f", self.temperature, self.threshold)

    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        """Same as the notebook's load_img: RGB, 224x224 bilinear, raw 0-255 float32."""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img = img.convert("RGB").resize((self.image_size, self.image_size), Image.BILINEAR)
        except (UnidentifiedImageError, OSError) as exc:
            raise InvalidImageError("File is not a valid image") from exc
        return np.asarray(img, dtype="float32")[None, ...]

    def predict(self, image_bytes: bytes) -> dict:
        x = self.preprocess(image_bytes)
        raw = self.model.predict(x, verbose=0)
        probs = calibrate(raw, self.temperature)[0]

        order = np.argsort(-probs)
        top = int(order[0])
        confidence = float(probs[top])
        uncertain = confidence < self.threshold
        label = self.classes[top]

        return {
            "predicted_class": label,
            "confidence": confidence,
            "is_uncertain": uncertain,
            "outcome": "uncertain" if uncertain else label,
            "threshold": self.threshold,
            "top_predictions": [
                {"label": self.classes[int(i)], "probability": float(probs[i])} for i in order[:3]
            ],
            "probabilities": {c: float(p) for c, p in zip(self.classes, probs)},
        }


model_service = ModelService()
