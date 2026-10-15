// Static model metrics from the training notebook.
// Live values (accuracy, F1, temperature, threshold) come from /model-info.

export const perClassF1: Array<{ label: string; f1: number; highlight?: boolean }> = [
  { label: "Forest", f1: 0.985 },
  { label: "Sea", f1: 0.97 },
  { label: "Street", f1: 0.952 },
  { label: "Buildings", f1: 0.949 },
  { label: "Mountain", f1: 0.907, highlight: true },
  { label: "Glacier", f1: 0.898, highlight: true },
];

// Confusion matrix: rows = actual, cols = predicted
// Classes order: buildings, forest, glacier, mountain, sea, street
// TODO: Replace placeholder values with the full matrix from your notebook.
export const CLASSES = ["buildings", "forest", "glacier", "mountain", "sea", "street"] as const;
export type SceneClass = (typeof CLASSES)[number];

// Full 6x6 confusion matrix (test set)
// Each row[i][j] = number of true-class-i samples predicted as class-j
export const confusionMatrix: number[][] = [
  // pred: bld  for  gla  mtn  sea  str
  [490, 0, 0, 0, 0, 16],   // actual: buildings
  [0, 502, 0, 0, 5, 0],    // actual: forest
  [0, 0, 458, 32, 14, 0],  // actual: glacier
  [0, 0, 37, 470, 5, 0],   // actual: mountain
  [0, 5, 6, 3, 490, 3],    // actual: sea
  [19, 0, 0, 0, 3, 469],   // actual: street
];

export const coverageAccuracy = [
  { threshold: 0.5, coverage: 0.9926, accuracy: 0.9467 },
  { threshold: 0.6, coverage: 0.9675, accuracy: 0.9599 },
  { threshold: 0.7, coverage: 0.9357, accuracy: 0.969, used: true },
  { threshold: 0.8, coverage: 0.8981, accuracy: 0.9756 },
  { threshold: 0.9, coverage: 0.8287, accuracy: 0.9825 },
  { threshold: 0.95, coverage: 0.7507, accuracy: 0.988 },
];

export const calibration = {
  eceBefore: 0.0284,
  eceAfter: 0.0135,
  nllBefore: 0.2041,
  nllAfter: 0.167,
};

export const trainingConfig = {
  backbone: "ResNet50",
  fineTunedLayers: "last 30",
  optimizer: "Adam",
  learningRates: ["1×10⁻³", "1×10⁻⁴"],
  batchSize: 64,
  earlyStopping: "validation loss",
  bestEpoch: 6,
  datasetSize: 17003,
};
