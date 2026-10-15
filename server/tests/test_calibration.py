import numpy as np

from app.core.calibration import calibrate


def test_rows_sum_to_one():
    p = np.array([[0.7, 0.2, 0.1], [0.98, 0.01, 0.01]])
    out = calibrate(p, 1.677)
    assert np.allclose(out.sum(axis=1), 1.0)


def test_argmax_unchanged_and_confidence_lower():
    p = np.array([[0.05, 0.9, 0.05]])
    out = calibrate(p, 1.677)
    assert out.argmax() == p.argmax()
    assert out.max() < p.max()  # T > 1 softens overconfident predictions


def test_temperature_one_is_identity():
    p = np.array([[0.1, 0.6, 0.3]])
    assert np.allclose(calibrate(p, 1.0), p)
