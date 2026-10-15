<div align="center">

# SceneSense: Scene Image Classifier

**A fine-tuned ResNet50 that classifies photos into six scene categories, with calibrated confidence and an honest "uncertain" outcome served by a FastAPI backend and a React web app.**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.20-FF6F00?logo=tensorflow&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Test accuracy](https://img.shields.io/badge/test%20accuracy-94.28%25-brightgreen)
![Macro F1](https://img.shields.io/badge/macro%20F1-0.9437-brightgreen)

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Key Results](#key-results)
3. [Repository Structure](#repository-structure)
4. [Dataset and Data Preparation](#dataset-and-data-preparation)
5. [Modelling Approach](#modelling-approach)
6. [Evaluation](#evaluation)
7. [Calibrated Confidence and the "Uncertain" Outcome](#calibrated-confidence-and-the-uncertain-outcome)
8. [Backend: FastAPI Service](#backend--fastapi-service)
9. [Frontend: React Web App](#frontend--react-web-app)
10. [Quick Start](#quick-start)
11. [Testing](#testing)
12. [Limitations](#limitations)
13. [Reproducing the Training](#reproducing-the-training)
14. [Acknowledgements](#acknowledgements)

---

## Overview

SceneSense classifies a photo into one of six scenes: **buildings, forest, glacier, mountain, sea, street**.

Most classifiers return a label with an inflated confidence score and no way to say "I'm not sure". This project treats that as a first-class problem:

- **Transfer learning.** Three ImageNet backbones (MobileNetV2, ResNet50, EfficientNetB0) were compared under identical settings. ResNet50 was selected on **validation** data only and fine-tuned.
- **Calibrated probabilities.** Temperature scaling (T = 1.677, fitted on validation data) makes the reported confidence track real accuracy. Expected Calibration Error on the test set fell from 0.0284 to 0.0135.
- **An explicit "uncertain" outcome.** Below a 0.70 calibrated confidence, the API returns `outcome: "uncertain"` while still exposing the top predictions. At that threshold the system answers 93.6% of images at 96.9% accuracy and catches about half of all errors.
- **A complete product, not just a notebook.** Training notebook, REST API with tests, and a production-style web client.

<div align="center">

| Upload | Classify | Review |
|---|---|---|
| Drag and drop a JPEG, PNG or WebP | One `POST /api/v1/predict` call | Class, calibrated confidence, top-3, all six probabilities |

</div>

---

## Key Results

| Metric (held-out test set, 2,551 images) | Value |
|---|---|
| Accuracy | **94.28%** |
| Macro F1 | **0.9437** |
| Errors | 146 of 2,551 |
| Test NLL (before → after calibration) | 0.2041 → **0.1670** |
| Test ECE (before → after calibration) | 0.0284 → **0.0135** |
| Coverage / accuracy at 0.70 threshold | **93.6% / 96.9%** |
| Exported inference model size | 97.1 MB (down from 217 MB) |

Validation accuracy (94.5%) and test accuracy (94.28%) agree closely, which indicates model selection did not overfit the validation set.

---

## Repository Structure

```
image-classification/
├── Model training (Notebook + Output Files)/
│   ├── <training notebook>.ipynb        # EDA → training → evaluation → export
│   └── figures/                         # all plots referenced in this README
│       ├── class_distribution.png
│       ├── sample_grid.png
│       ├── dimensions_aspect.png
│       ├── train_val_comparison.png
│       ├── augmentation_examples.png
│       ├── backbone_comparison.png
│       ├── finetune_curves.png
│       ├── confusion_val.png
│       ├── reliability_val.png
│       ├── confusion_test.png
│       ├── misclassified_test.png
│       └── coverage_accuracy_test.png
│
├── server/                              # FastAPI inference service
│   ├── app/
│   │   ├── main.py                      # app factory, CORS, model loaded once at startup
│   │   ├── api/routes.py                # /health, /model-info, /predict
│   │   ├── core/
│   │   │   ├── config.py                # env-overridable settings
│   │   │   ├── calibration.py           # temperature scaling (NumPy only)
│   │   │   └── layers.py                # BackbonePreprocess custom Keras layer
│   │   ├── schemas/prediction.py        # Pydantic request/response models
│   │   └── services/model_service.py    # load, preprocess, predict, uncertain rule
│   ├── models/
│   │   ├── model_config.json            # classes, image size, T, threshold, metrics
│   │   ├── temperature.json             # fitted temperature
│   │   └── resnet50_inference.keras     # exported model (97.1 MB)
│   ├── tests/                           # unit, API and notebook-consistency tests
│   ├── requirements.txt
│   └── .env.example
│
└── client/                              # React + TypeScript web app
    ├── src/
    │   ├── api/                         # typed fetch client, endpoints, errors
    │   ├── components/                  # layout, landing, classify
    │   ├── hooks/                       # TanStack Query hooks, history, theme
    │   ├── pages/                       # Landing, Classify, History, Model, API docs
    │   ├── config/                      # Zod-validated env, nav, links
    │   ├── data/                        # static content and model metrics
    │   ├── lib/                         # formatting, image, file validation
    │   └── test/                        # Vitest + React Testing Library + MSW
    ├── package.json
    └── .env.example
```

---

## Dataset and Data Preparation

**Source:** [Intel Image Classification (Kaggle)](https://www.kaggle.com/datasets/puneet6060/intel-image-classification) natural and urban scenes in six classes. The notebook merges the original `seg_train` and `seg_test` folders (17,034 labelled images) and builds its own split.

### Cleaning

| Check | Result |
|---|---|
| Corrupted or unreadable files | 0 |
| Images not 150×150 | 55 (0.32%), minimum height 72 px kept |
| Exact duplicate files (MD5) | 36 files in 18 groups |
| Duplicate groups with **conflicting labels** | 13 |
| Removed (conflicting-label duplicates) | 26 |
| Removed (same-label duplicates) | 5 |
| **Final dataset** | **17,003 images** |

Duplicates with conflicting labels were removed entirely so that no ambiguous ground truth leaks into training or evaluation.

### Stratified 70 / 15 / 15 split (seed 42)

| Class | Train | Validation | Test |
|---|---:|---:|---:|
| mountain | 2,120 | 454 | 455 |
| glacier | 2,065 | 442 | 443 |
| street | 2,013 | 431 | 432 |
| sea | 1,948 | 417 | 417 |
| forest | 1,920 | 412 | 411 |
| buildings | 1,836 | 394 | 393 |
| **Total** | **11,902** | **2,550** | **2,551** |

The notebook asserts there is **no file overlap** between the three splits (verified by hash).

### Exploratory analysis

**Class balance.** The imbalance ratio is 1.15, so the classes are effectively balanced. No class weighting or resampling was used; macro-F1 and per-class recall are reported so a weak class cannot hide behind overall accuracy.

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/class_distribution.png" alt="Class distribution after cleaning" width="620">
</p>

**Visual diversity and ambiguity.** Classes are internally diverse, and three boundaries are inherently ambiguous: glacier vs mountain, mountain vs sea, and buildings vs street. Several street images are grayscale or sepia, so colour is not a reliable cue for every class. This directly shaped the augmentation policy (no hue shifts).

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/sample_grid.png" alt="Five sample images per class" width="760">
</p>

**Image dimensions.** Every image is 150 px wide; almost all are square. All images are resized to 224×224 with bilinear interpolation, the native input size of the candidate backbones.

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/dimensions_aspect.png" alt="Image dimension and aspect ratio distribution" width="680">
</p>

**Split comparability.** Class proportions are nearly identical across splits, and mean brightness matches (113.2 train vs 113.3 validation), so validation metrics are a fair proxy for generalisation.

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/train_val_comparison.png" alt="Train vs validation comparability" width="680">
</p>

### Augmentation (training set only)

| Transform | Setting | Rationale |
|---|---|---|
| Horizontal flip | on | Scenes are left/right symmetric |
| Vertical flip | **off** | Scenes have a natural up direction (sky above) |
| Rotation | ±11° | Camera tilt |
| Translation | 5% | Framing variation |
| Zoom | **in only**, 0–15% | Zooming out creates empty borders |
| Brightness | ±10% | Lighting (±20% blew skies out to white) |
| Contrast | ±20% | Lighting |
| Hue shift | **off** | Colour is a key cue for some classes |
| Border fill | nearest pixel | `reflect` produced mirrored artefacts |

The final policy was reached after two rejected iterations, which produced mirrored borders, blown-out skies and smeared edges.

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/augmentation_examples.png" alt="Augmented examples next to originals" width="760">
</p>

---

## Modelling Approach

### Architecture

```
Raw RGB (0–255), 224×224×3
        │
BackbonePreprocess   ← backbone-specific normalisation, inside the saved model
        │
Pretrained ImageNet backbone (ResNet50)
        │
GlobalAveragePooling2D
        │
Dense(256, ReLU) → Dropout(0.4)
        │
Dense(6, softmax)
```

Normalisation lives **inside** the model, so the saved artefact accepts raw 0–255 pixels and the API needs no separate preprocessing code. This removes a common source of train/serve skew.

### Two-stage training

| Stage | What trains | Learning rate | Max epochs |
|---|---|---|---|
| 1: Head only | New classifier head, frozen backbone | 1e-3 | 15 |
| 2:  Fine-tuning | Last 30 backbone layers (40 for EfficientNetB0), **BatchNorm kept frozen** | 1e-4 | 20 |

### Full configuration

| Setting | Value |
|---|---|
| Framework | TensorFlow / Keras 2.20.0 |
| Hardware | 2× NVIDIA T4 (`MirroredStrategy`) |
| Global batch size | 64 (32 per GPU) |
| Loss / optimiser | Sparse categorical cross-entropy / Adam |
| Callbacks | `EarlyStopping` (val loss, patience 4, restore best), `ModelCheckpoint` (best val loss), `ReduceLROnPlateau` (factor 0.5, patience 2, min 1e-6) |
| Seed | 42 |
| Input pipeline | `tf.data` with in-RAM uint8 cache; 186 train / 40 validation steps per epoch |

### Experiment 1: backbone comparison (frozen backbone, identical settings)

| Backbone | Params | Best epoch | Train acc | Val acc | Val loss |
|---|---:|---:|---:|---:|---:|
| MobileNetV2 | 2.59 M | 13 | 0.9403 | 0.9235 | 0.1987 |
| **ResNet50** | 24.11 M | 6 | 0.9340 | **0.9341** | **0.1698** |
| EfficientNetB0 | 4.38 M | 11 | 0.9539 | 0.9337 | 0.1717 |

MobileNetV2 was rejected (lowest accuracy, not converged by epoch 15). ResNet50 and EfficientNetB0 were within noise of each other, so both advanced to fine-tuning. EfficientNetB0 began to overfit the head after roughly epoch 9.

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/backbone_comparison.png" alt="Backbone comparison on validation data" width="760">
</p>

### Experiment 2: fine-tuning (validation data only; test set untouched)

| Model | Epochs run | Best epoch | Train acc | Val acc | Val loss | Trainable params |
|---|---:|---:|---:|---:|---:|---:|
| **ResNet50** | 10 | 6 | 0.9745 | **0.9451** | 0.1833 | 14.95 M |
| EfficientNetB0 | 7 | 3 | 0.9650 | 0.9392 | **0.1696** | 2.37 M |

**Decision:** ResNet50 was chosen as the final model on validation results (higher accuracy, macro-F1 0.946 vs 0.940, fewer errors on both hard pairs: glacier/mountain 65 vs 73, buildings/street 39 vs 50). EfficientNetB0 has lower validation loss and is far smaller; it remains a good candidate if model size matters more than the ~0.6-point accuracy gap.

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/finetune_curves.png" alt="Fine-tuning curves" width="760">
</p>

---

## Evaluation

### Validation comparison

Both fine-tuned models classify forest (F1 ≈ 0.99) and sea (F1 0.97) almost perfectly, and both struggle with the same two ambiguous boundaries.

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/confusion_val.png" alt="Validation confusion matrices" width="760">
</p>

### Final test-set results (used once)

| Class | Precision | Recall | F1 | Support |
|---|---:|---:|---:|---:|
| buildings | 0.947 | 0.952 | 0.949 | 393 |
| forest | 0.981 | 0.990 | **0.985** | 411 |
| glacier | 0.904 | 0.892 | 0.898 | 443 |
| mountain | 0.921 | 0.895 | 0.907 | 455 |
| sea | 0.967 | 0.974 | 0.970 | 417 |
| street | 0.941 | 0.963 | 0.952 | 432 |
| **Accuracy** | | | **0.9428** | 2,551 |
| **Macro avg** | 0.943 | 0.944 | **0.9437** | 2,551 |

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/confusion_test.png" alt="ResNet50 confusion matrix on the test set" width="620">
</p>

Test confusion matrix (rows = true class, columns = predicted):

| true \ pred | buildings | forest | glacier | mountain | sea | street |
|---|---:|---:|---:|---:|---:|---:|
| **buildings** | 374 | 0 | 0 | 0 | 0 | 19 |
| **forest** | 0 | 407 | 1 | 2 | 1 | 0 |
| **glacier** | 1 | 6 | 395 | 32 | 7 | 2 |
| **mountain** | 1 | 1 | 37 | 407 | 6 | 3 |
| **sea** | 3 | 1 | 4 | 1 | 406 | 2 |
| **street** | 16 | 0 | 0 | 0 | 0 | 416 |

### Error analysis

The model made **146 errors** in 2,551 images. Four confusion directions explain about **71%** of them:

| True → Predicted | Count |
|---|---:|
| mountain → glacier | 37 |
| glacier → mountain | 32 |
| buildings → street | 19 |
| street → buildings | 16 |

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/misclassified_test.png" alt="Grid of misclassified test images" width="760">
</p>

**Why the model fails** (from inspecting the misclassified grid):

- **Overlapping classes.** Snow-covered peaks appear under both *mountain* and *glacier*. Several errors occur at 0.99 confidence, which points to ambiguous labels rather than a model weakness.
- **Scene content vs label.** Some glacier-labelled images are mostly trees, a waterfall or a coastline; the model follows the dominant object in the frame.
- **Similar structures.** A street between buildings, a railway platform, a bridge or a harbour with houses can legitimately take more than one label.
- **Image quality.** Grayscale and low-contrast images appear among the errors.
- **Resolution.** Images are ~150 px per side, which limits the fine texture that separates ice from rock.

---

## Calibrated Confidence and the "Uncertain" Outcome

### Temperature scaling

Fine-tuned networks are typically overconfident. Temperature scaling divides the log-probabilities by a single learned constant **T** before the softmax. It **never changes the predicted class** (verified in the notebook) it only makes the confidence honest.

```
calibrated = softmax( log(clip(p, 1e-12, 1)) / T ),   T = 1.677
```

T was fitted on the **validation set only**; T > 1 confirms the raw model was overconfident.

| Split | NLL before → after | ECE before → after |
|---|---|---|
| Validation | 0.1833 → 0.1569 | 0.0232 → 0.0078 |
| Test | 0.2041 → 0.1670 | 0.0284 → 0.0135 |

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/reliability_val.png" alt="Reliability diagram before and after temperature scaling" width="760">
</p>

### Choosing the threshold

Confidence is informative: wrong predictions average **0.722**, correct ones **0.957**. Raising the threshold trades coverage for accuracy:

| Threshold | Coverage | Accuracy on answered | Sent to "uncertain" | Errors caught | Errors left |
|---:|---:|---:|---:|---:|---:|
| 0.50 | 99.26% | 94.67% | 19 | 11 | 135 |
| 0.60 | 96.75% | 95.99% | 83 | 47 | 99 |
| **0.70** | **93.57%** | **96.90%** | **164** | **72** | **74** |
| 0.80 | 89.81% | 97.56% | 260 | 90 | 56 |
| 0.90 | 82.87% | 98.25% | 437 | 109 | 37 |
| 0.95 | 75.07% | 98.80% | 636 | 123 | 23 |

<p align="center">
  <img src="Model%20training%20%28Notebook%20%2B%20Output%20Files%29/figures/coverage_accuracy_test.png" alt="Coverage versus accuracy by confidence threshold" width="620">
</p>

**Production choice: 0.70.** The system removes about half of all errors (72 of 146) for a 6.4% loss in coverage. Below the threshold it responds "uncertain, please review" while still showing the top predictions. Users needing higher accuracy can raise the threshold.

> **Caveat:** the threshold curve was inspected on the test set, so the 96.9% figure is slightly optimistic. Confirm it on fresh data before relying on it.

---

## Backend: FastAPI Service

The service loads the Keras model **once at startup** (with a warm-up inference so the first request is not slow), then serves predictions over REST. Interactive docs are generated automatically at `/docs` (Swagger) and `/redoc`.

### Inference pipeline

```
upload ─► validate type/size ─► open as RGB ─► resize 224×224 (bilinear)
       ─► raw float32 0–255 ─► model (preprocessing built in) ─► softmax probs
       ─► temperature scaling ─► top-3 + uncertain rule ─► JSON
```

Preprocessing is intentionally identical to the notebook's `load_img` so the API reproduces notebook predictions exactly (max probability difference 1.2e-06 on reload).

### Endpoints

Base path: `/api/v1`

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness and whether the model is loaded |
| `GET` | `/model-info` | Classes, image size, temperature, threshold, test metrics |
| `POST` | `/predict` | Classify one image (multipart field `file`) |

#### `GET /api/v1/health`

```json
{ "status": "ok", "model_loaded": true }
```

#### `GET /api/v1/model-info`

```json
{
  "classes": ["buildings", "forest", "glacier", "mountain", "sea", "street"],
  "image_size": 224,
  "temperature": 1.677255379888841,
  "uncertain_threshold": 0.7,
  "test_accuracy": 0.9428,
  "test_macro_f1": 0.9437
}
```

#### `POST /api/v1/predict`

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -F "file=@photo.jpg;type=image/jpeg"
```

Example response (values illustrative):

```json
{
  "filename": "photo.jpg",
  "predicted_class": "glacier",
  "confidence": 0.6385,
  "is_uncertain": true,
  "outcome": "uncertain",
  "threshold": 0.7,
  "top_predictions": [
    { "label": "glacier",  "probability": 0.6385 },
    { "label": "mountain", "probability": 0.2910 },
    { "label": "sea",      "probability": 0.0412 }
  ],
  "probabilities": {
    "buildings": 0.0021, "forest": 0.0034, "glacier": 0.6385,
    "mountain": 0.2910, "sea": 0.0412, "street": 0.0238
  }
}
```

| Field | Meaning |
|---|---|
| `predicted_class` | Top class **always returned** |
| `confidence` | Calibrated probability of the top class (0–1) |
| `is_uncertain` | `true` when `confidence < threshold` |
| `outcome` | Same as `predicted_class`, or `"uncertain"` below the threshold |
| `top_predictions` | Exactly three entries, sorted descending |
| `probabilities` | All six calibrated probabilities (sum to 1) |

#### Error responses

| Status | Cause |
|---|---|
| `400` | Empty file, or bytes that are not a readable image |
| `413` | File larger than `MAX_UPLOAD_MB` (default 10) |
| `415` | Content type is not JPEG, PNG or WebP |
| `422` | Missing `file` field (FastAPI validation) |
| `503` | Model not loaded yet |

### Configuration

Copy `server/.env.example` to `server/.env` to override defaults.

| Variable | Default | Description |
|---|---|---|
| `CORS_ORIGINS` | `["http://localhost:5174","http://localhost:3000"]` | JSON list of allowed frontend origins |
| `MAX_UPLOAD_MB` | `10` | Maximum upload size |

> The Vite dev server runs on port **5173**. Make sure `CORS_ORIGINS` includes `http://localhost:5173` (as in `.env.example`), or the browser will block requests.

### Model artefacts

`server/models/` must contain the three files exported by the notebook:

| File | Purpose |
|---|---|
| `resnet50_inference.keras` | Inference model without optimiser state (97.1 MB) |
| `model_config.json` | Classes, image size, temperature, threshold, test metrics |
| `temperature.json` | Fitted temperature |

The model file is close to GitHub's 100 MB limit. Commit it, track it with Git LFS, or attach it to a GitHub Release.

`BackbonePreprocess` (a registered custom Keras layer under the package name `seker`) is required to deserialise the model; it lives in `app/core/layers.py` and must keep that name.

---

## Frontend: React Web App

A responsive, accessible single-page app for uploading images and inspecting results.

### Tech stack

| Category | Library |
|---|---|
| Framework | React 19 + TypeScript (strict) + Vite |
| Styling | Tailwind CSS v4 with CSS-variable design tokens |
| Routing | React Router v7 (lazy-loaded pages) |
| Server state | TanStack Query v5 |
| HTTP | Custom `fetch` client with timeout and abort (`src/api/client.ts`) |
| Upload | react-dropzone |
| Charts | Recharts |
| Validation | Zod (environment variables) |
| Icons / font | lucide-react / Inter (self-hosted) |
| Testing | Vitest + React Testing Library + MSW |
| Linting | oxlint |

### Pages

| Route | Page | What it does |
|---|---|---|
| `/` | Landing | Product overview, features, how it works, class grid, model snapshot, limitations, FAQ |
| `/app` | Classify | Drag-and-drop upload, preview, result panel with confidence meter, top-3, probability bars and an uncertain alert |
| `/app/history` | History | Last 20 classifications (thumbnails and results), stored in `localStorage` |
| `/app/model` | Model | Per-class F1, confusion matrix, coverage-vs-accuracy and calibration metrics |
| `/app/api` | API | In-app API reference |
| `*` | 404 | Not-found page |

### Design principles

- **Single HTTP boundary.** Components never call `fetch` or build URLs; everything goes through `src/api/client.ts` and typed endpoint wrappers. Response types in `src/api/types.ts` mirror the backend's Pydantic schemas.
- **Typed error handling.** An `ApiError` class with a `kind` discriminant (`validation`, `tooLarge`, `unsupported`, `server`, `network`, `timeout`, `cancelled`) is mapped to friendly user messages raw backend errors are never shown.
- **Fail-fast configuration.** All settings are read from `VITE_*` variables and validated with Zod at startup; the app refuses to start with a clear message if one is missing or malformed. No URLs are hardcoded.
- **Client-side pre-validation.** File type and size are checked before upload.
- **Live backend status.** A health poll drives a status badge so users know when the model is starting up.
- **Theming.** Light, dark or system, persisted in `localStorage`; an inline script in `index.html` sets the theme before first paint to avoid a flash.
- **Accessibility (WCAG 2.2 AA target).** Semantic landmarks, skip-to-content link, visible focus rings, ARIA live region for results, and colour is never the only signal.
- **Privacy.** The API stores nothing; history lives only in the user's own browser.

### Environment variables

All are required except `VITE_GITHUB_URL`.

| Variable | Example | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Backend origin, no trailing slash |
| `VITE_API_PREFIX` | `/api/v1` | API path prefix, must start with `/` |
| `VITE_REQUEST_TIMEOUT_MS` | `30000` | Request timeout |
| `VITE_MAX_UPLOAD_MB` | `10` | Must match the backend's `MAX_UPLOAD_MB` |
| `VITE_ALLOWED_MIME` | `image/jpeg,image/png,image/webp` | Accepted MIME types |
| `VITE_APP_NAME` | `SceneSense` | Display name |
| `VITE_GITHUB_URL` | *(optional)* | Repo link shown in header and footer |
| `VITE_HEALTH_POLL_MS` | `30000` | Health-check interval |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (port 5173) |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |
| `npm run test` | Vitest in watch mode |
| `npm run test:run` | Single test run (CI) |

---

## Quick Start

### Prerequisites

- Python 3.11 and `pip`
- Node.js 20+ and `npm`
- The three model files in `server/models/` (see [Model artefacts](#model-artefacts))

### 1. Clone

```bash
git clone https://github.com/mzainnasir010/image-classification.git
cd image-classification
```

### 2. Run the backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # allow http://localhost:5173 in CORS_ORIGINS
uvicorn app.main:app --reload --port 8000
```

- API: <http://localhost:8000/api/v1/health>
- Docs: <http://localhost:8000/docs>

### 3. Run the frontend

```bash
cd client
npm install
cp .env.example .env.local         # set VITE_API_BASE_URL if the backend is elsewhere
npm run dev
```

Open <http://localhost:5173>. Keep the backend running first.

### Deploying

1. Deploy the backend anywhere that runs a Python ASGI app. Set `CORS_ORIGINS` to the **exact** frontend origin (scheme + host + port, no trailing slash).
2. Set `VITE_API_BASE_URL` to the deployed backend URL and run `npm run build`. Variables are baked in at build time.
3. Host `client/dist/` on any static host (Vercel, Netlify, Cloudflare Pages, etc.).

**CORS troubleshooting:** a browser error mentioning "blocked by CORS policy" means the frontend origin is not in `CORS_ORIGINS`. Check scheme, host and port (`:5173` and `:5174` are different origins), then restart the backend.

---

## Testing

### Backend

```bash
cd server
pytest -q
```

| Test | What it verifies |
|---|---|
| `test_calibration.py` | Rows sum to 1, argmax unchanged, T=1 is the identity, T>1 lowers confidence |
| `test_api.py` | `/health`, `/model-info`, response shape, 415 and 400 error paths |
| `test_matches_notebook` | 12 fixture images reproduce the notebook's predicted class and confidence (±0.01) |

API tests are skipped automatically if the model files are not present.

### Frontend

```bash
cd client
npx vitest run
```

Suites cover environment validation, file validation, theme and history hooks, and the classify flow (with MSW mocking the API).

---

## Limitations

- **Six classes only.** The model cannot recognise objects within a scene or any category outside buildings, forest, glacier, mountain, sea and street.
- **Ambiguous classes.** Glacier/mountain and buildings/street account for ~71% of errors, some of which come from genuinely overlapping labels. Several wrong predictions are made with high confidence.
- **Low-resolution training data.** Source images are ~150 px, which limits fine-texture discrimination.
- **Dataset domain.** Performance on images very different from the Intel dataset (for example heavy filters, aerial or indoor scenes) is untested.
- **Threshold estimate is optimistic.** The 0.70 threshold was inspected on the test set; verify the 96.9% figure on fresh data.
- **Single-image, synchronous API.** There is no batching, authentication or rate limiting. Add these before exposing the service publicly.

---

## Reproducing the Training

The notebook was run on Kaggle (2× T4 GPUs, TensorFlow 2.20.0) with the Intel Image Classification dataset attached. Run it top to bottom: it cleans and splits the data, trains the three backbones, fine-tunes ResNet50 and EfficientNetB0, calibrates, evaluates once on the test set, and exports the inference package (`resnet50_inference.keras`, `model_config.json`, `temperature.json`, and all figures). The random seed is fixed at 42.

---

## Acknowledgements

- Dataset: [Intel Image Classification](https://www.kaggle.com/datasets/puneet6060/intel-image-classification) on Kaggle.
- Pretrained backbones from `tf.keras.applications` (ImageNet weights)

## Author

**Muhammad Zain Nasir**
[GitHub](https://github.com/mzainnasir010) | [LinkedIn](https://www.linkedin.com/in/muhammadin-zain-nasir/) | [Portfolio](https://www.mzainnasir.dev/)