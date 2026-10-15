import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { HealthResponse, ModelInfoResponse, PredictionResponse } from "../api/types";

const BASE = "http://localhost:8000/api/v1";

export const mockHealth: HealthResponse = { status: "ok", model_loaded: true };

export const mockModelInfo: ModelInfoResponse = {
  classes: ["buildings", "forest", "glacier", "mountain", "sea", "street"],
  image_size: 224,
  temperature: 1.677,
  uncertain_threshold: 0.7,
  test_accuracy: 0.9428,
  test_macro_f1: 0.9437,
};

export const mockPrediction: PredictionResponse = {
  filename: "test.jpg",
  predicted_class: "forest",
  confidence: 0.962,
  is_uncertain: false,
  outcome: "forest",
  threshold: 0.7,
  top_predictions: [
    { label: "forest", probability: 0.962 },
    { label: "mountain", probability: 0.023 },
    { label: "glacier", probability: 0.011 },
  ],
  probabilities: {
    buildings: 0.001,
    forest: 0.962,
    glacier: 0.011,
    mountain: 0.023,
    sea: 0.002,
    street: 0.001,
  },
};

export const mockUncertainPrediction: PredictionResponse = {
  filename: "ambiguous.jpg",
  predicted_class: "glacier",
  confidence: 0.52,
  is_uncertain: true,
  outcome: "uncertain",
  threshold: 0.7,
  top_predictions: [
    { label: "glacier", probability: 0.52 },
    { label: "mountain", probability: 0.41 },
    { label: "sea", probability: 0.05 },
  ],
  probabilities: {
    buildings: 0.01,
    forest: 0.0,
    glacier: 0.52,
    mountain: 0.41,
    sea: 0.05,
    street: 0.01,
  },
};

export const handlers = [
  http.get(`${BASE}/health`, () => HttpResponse.json(mockHealth)),
  http.get(`${BASE}/model-info`, () => HttpResponse.json(mockModelInfo)),
  http.post(`${BASE}/predict`, () => HttpResponse.json(mockPrediction)),
];

export const server = setupServer(...handlers);
