"""
Evaluation Module
==================
Standalone evaluation script for trained models.
Generates evaluation reports with visualisation data.
"""

import json
import logging
import os
from typing import Dict

import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset

from model import build_model
from data_pipeline import DataPipeline
from train import compute_rmse, compute_mae, compute_r, compute_r2

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def load_and_evaluate(
    weights_path: str = "pretrained_weights/cnn_lstm_aqi.pth",
    cpcb_csv: str = None,
) -> Dict:
    """
    Load a trained model and evaluate on test data.

    Returns
    -------
    dict
        Evaluation metrics per target variable.
    """
    # Prepare data
    pipeline = DataPipeline()
    X, y = pipeline.run_pipeline(cpcb_csv)

    # Test split (last 15%)
    n_test = int(len(X) * 0.15)
    X_test = X[-n_test:]
    y_test = y[-n_test:]

    # Build and load model
    config = {
        "input_features": X.shape[2],
        "num_outputs": y.shape[1],
        "use_spatial": False,
    }
    model = build_model(config)

    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        logger.info(f"Loaded weights from {weights_path}")
    else:
        logger.warning(f"Weights not found at {weights_path}. Using untrained model.")

    model.eval()

    # Predict
    X_tensor = torch.FloatTensor(X_test)
    with torch.no_grad():
        predictions = model(X_tensor).numpy()

    if predictions.shape[1] > y_test.shape[1]:
        predictions = predictions[:, :y_test.shape[1]]

    # Compute metrics
    target_names = ["PM2.5", "NO2", "SO2", "CO", "O3"][:y_test.shape[1]]
    results = {}

    for i, name in enumerate(target_names):
        yt = y_test[:, i]
        yp = predictions[:, i]
        results[name] = {
            "rmse": round(compute_rmse(yt, yp), 4),
            "mae": round(compute_mae(yt, yp), 4),
            "r": round(compute_r(yt, yp), 4),
            "r2": round(compute_r2(yt, yp), 4),
            "n_samples": len(yt),
            "y_true_mean": round(float(np.mean(yt)), 4),
            "y_pred_mean": round(float(np.mean(yp)), 4),
        }

    # Print report
    print("\n" + "=" * 70)
    print("MODEL EVALUATION REPORT")
    print("=" * 70)
    print(f"{'Target':<10} {'RMSE':>10} {'MAE':>10} {'R':>10} {'R²':>10}")
    print("-" * 50)
    for name, m in results.items():
        print(f"{name:<10} {m['rmse']:>10.4f} {m['mae']:>10.4f} {m['r']:>10.4f} {m['r2']:>10.4f}")
    print("=" * 70)

    return results


if __name__ == "__main__":
    metrics = load_and_evaluate()

    # Save report
    os.makedirs("pretrained_weights", exist_ok=True)
    with open("pretrained_weights/evaluation_report.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print("\nReport saved to pretrained_weights/evaluation_report.json")
