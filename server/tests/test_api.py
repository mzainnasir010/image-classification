import io
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.core.config import settings

pytestmark = pytest.mark.skipif(
    not (settings.models_dir / "model_config.json").exists(),
    reason="Model files not in models/ yet",
)

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def client():
    from app.main import app

    with TestClient(app) as c:  # runs lifespan, loads the model
        yield c


def _jpeg_bytes(size=(150, 150), color=(120, 160, 200)):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format="JPEG")
    return buf.getvalue()


def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200 and r.json()["model_loaded"] is True


def test_model_info(client):
    body = client.get("/api/v1/model-info").json()
    assert len(body["classes"]) == 6 and body["uncertain_threshold"] == 0.70


def test_predict_shape(client):
    r = client.post("/api/v1/predict", files={"file": ("x.jpg", _jpeg_bytes(), "image/jpeg")})
    assert r.status_code == 200
    body = r.json()
    assert abs(sum(body["probabilities"].values()) - 1.0) < 1e-4
    assert len(body["top_predictions"]) == 3
    assert body["is_uncertain"] == (body["confidence"] < body["threshold"])


def test_rejects_non_image(client):
    r = client.post("/api/v1/predict", files={"file": ("x.txt", b"hello", "text/plain")})
    assert r.status_code == 415


def test_rejects_corrupt_image(client):
    r = client.post("/api/v1/predict", files={"file": ("x.jpg", b"not an image", "image/jpeg")})
    assert r.status_code == 400


@pytest.mark.skipif(not (FIXTURES / "expected.json").exists(), reason="No notebook fixtures")
def test_matches_notebook(client):
    expected = json.loads((FIXTURES / "expected.json").read_text())
    for item in expected:
        data = (FIXTURES / item["file"]).read_bytes()
        r = client.post("/api/v1/predict", files={"file": (item["file"], data, "image/jpeg")})
        body = r.json()
        assert body["predicted_class"] == item["pred"]
        assert abs(body["confidence"] - item["conf"]) < 0.01
