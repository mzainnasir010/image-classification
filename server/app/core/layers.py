"""Custom layer needed to load the saved model. Copied from cell 51 of the notebook.

It must keep the same package name ("seker") and class name, or load_model fails.
"""
import tensorflow as tf
from tensorflow.keras import applications as apps
from tensorflow.keras import layers


@tf.keras.utils.register_keras_serializable(package="seker")
class BackbonePreprocess(layers.Layer):
    """Applies the preprocessing each pretrained backbone expects (input: raw 0-255 RGB)."""

    def __init__(self, kind, **kwargs):
        super().__init__(**kwargs)
        self.kind = kind
        self._fn = {
            "mobilenetv2": apps.mobilenet_v2.preprocess_input,
            "resnet50": apps.resnet50.preprocess_input,
            "efficientnetb0": apps.efficientnet.preprocess_input,
        }[kind]

    def call(self, x):
        return self._fn(x)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"kind": self.kind})
        return cfg
