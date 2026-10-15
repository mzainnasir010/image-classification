"""Temperature scaling, identical to cell 73 of the notebook. NumPy only (no TensorFlow)."""
import numpy as np


def calibrate(probs: np.ndarray, temperature: float) -> np.ndarray:
    """probs: (N, C) softmax output. Returns calibrated probabilities (argmax is unchanged).

    Same steps as the notebook: log(clip(p)) -> divide by T -> softmax.
    """
    logp = np.log(np.clip(probs, 1e-12, 1.0))
    z = logp / temperature
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)
