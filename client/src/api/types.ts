// All API response types. Mirrors the backend's Pydantic schemas exactly.
// Do NOT add fields that the backend does not return.

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
}

export interface ModelInfoResponse {
  classes: string[];
  image_size: number;
  temperature: number;
  uncertain_threshold: number;
  test_accuracy: number | null;
  test_macro_f1: number | null;
}

export interface ClassScore {
  label: string;
  probability: number; // 0..1
}

export interface PredictionResponse {
  filename: string | null;
  predicted_class: string;
  confidence: number;       // calibrated, 0..1
  is_uncertain: boolean;    // confidence < threshold
  outcome: string;          // predicted_class or "uncertain"
  threshold: number;
  top_predictions: ClassScore[]; // exactly 3, sorted descending
  probabilities: Record<string, number>; // all 6 classes, sums to 1
}
