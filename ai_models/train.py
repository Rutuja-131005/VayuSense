"""
Training Pipeline
==================
Handles model training with:
- Learning rate scheduling (ReduceLROnPlateau)
- Early stopping
- Gradient clipping
- Train/Validation/Test split
- TensorBoard-compatible logging
- Model checkpointing

Evaluation Metrics
-------------------
- RMSE (Root Mean Square Error)
- MAE (Mean Absolute Error)
- R (Pearson Correlation Coefficient)
- R² (Coefficient of Determination)
"""

import os
import json
import logging
import time
from typing import Dict, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset, random_split

from model import CNNLSTM_AQI, build_model
from data_pipeline import DataPipeline

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")


# ─────────────────────────────────────────────────────────────────
# Evaluation Metrics
# ─────────────────────────────────────────────────────────────────
def compute_rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Root Mean Square Error: √(1/n · Σ(ŷᵢ - yᵢ)²)"""
    return float(np.sqrt(np.mean((y_pred - y_true) ** 2)))


def compute_mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Absolute Error: (1/n) · Σ|ŷᵢ - yᵢ|"""
    return float(np.mean(np.abs(y_pred - y_true)))


def compute_r(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Pearson Correlation Coefficient."""
    if y_true.std() == 0 or y_pred.std() == 0:
        return 0.0
    return float(np.corrcoef(y_true.flatten(), y_pred.flatten())[0, 1])


def compute_r2(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Coefficient of Determination: R² = 1 - SS_res / SS_tot
    where SS_res = Σ(yᵢ - ŷᵢ)², SS_tot = Σ(yᵢ - ȳ)²
    """
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    if ss_tot == 0:
        return 0.0
    return float(1 - ss_res / ss_tot)


def evaluate_model(
    y_true: np.ndarray, y_pred: np.ndarray, target_names: list = None
) -> Dict[str, Dict[str, float]]:
    """
    Compute all metrics for each target variable.

    Returns
    -------
    dict
        {target_name: {rmse, mae, r, r2}}
    """
    if target_names is None:
        target_names = [f"target_{i}" for i in range(y_true.shape[1])]

    results = {}
    for i, name in enumerate(target_names):
        yt = y_true[:, i]
        yp = y_pred[:, i]
        results[name] = {
            "rmse": round(compute_rmse(yt, yp), 4),
            "mae": round(compute_mae(yt, yp), 4),
            "r": round(compute_r(yt, yp), 4),
            "r2": round(compute_r2(yt, yp), 4),
        }
    return results


# ─────────────────────────────────────────────────────────────────
# Training Class
# ─────────────────────────────────────────────────────────────────
class Trainer:
    """
    Manages the full training lifecycle of the CNN-LSTM model.
    """

    TARGET_NAMES = ["PM2.5", "NO2", "SO2", "CO", "O3"]

    def __init__(
        self,
        model: CNNLSTM_AQI,
        learning_rate: float = 1e-3,
        weight_decay: float = 1e-5,
        epochs: int = 100,
        batch_size: int = 32,
        patience: int = 10,
        device: str = "auto",
        save_dir: str = "pretrained_weights",
    ):
        self.model = model
        self.epochs = epochs
        self.batch_size = batch_size
        self.patience = patience
        self.save_dir = save_dir

        # Device
        if device == "auto":
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)
        self.model.to(self.device)

        # Loss and optimizer
        self.criterion = nn.MSELoss()
        self.optimizer = torch.optim.Adam(
            model.parameters(), lr=learning_rate, weight_decay=weight_decay
        )
        self.scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode="min", factor=0.5, patience=5, verbose=True
        )

        # Training history
        self.history = {"train_loss": [], "val_loss": [], "lr": []}
        self.best_val_loss = float("inf")
        self.patience_counter = 0

        os.makedirs(save_dir, exist_ok=True)

    def prepare_data(
        self, X: np.ndarray, y: np.ndarray, val_ratio: float = 0.15, test_ratio: float = 0.15
    ) -> Tuple[DataLoader, DataLoader, DataLoader]:
        """
        Split data into train/val/test and create DataLoaders.

        Split Strategy:
        - Temporal split (no shuffling) to prevent data leakage.
        - Train: first 70%, Val: next 15%, Test: last 15%.
        """
        n = len(X)
        n_test = int(n * test_ratio)
        n_val = int(n * val_ratio)
        n_train = n - n_val - n_test

        X_tensor = torch.FloatTensor(X)
        y_tensor = torch.FloatTensor(y)

        train_ds = TensorDataset(X_tensor[:n_train], y_tensor[:n_train])
        val_ds = TensorDataset(X_tensor[n_train:n_train + n_val], y_tensor[n_train:n_train + n_val])
        test_ds = TensorDataset(X_tensor[n_train + n_val:], y_tensor[n_train + n_val:])

        train_loader = DataLoader(train_ds, batch_size=self.batch_size, shuffle=True)
        val_loader = DataLoader(val_ds, batch_size=self.batch_size, shuffle=False)
        test_loader = DataLoader(test_ds, batch_size=self.batch_size, shuffle=False)

        logger.info(
            f"Data split — Train: {n_train}, Val: {n_val}, Test: {n_test}"
        )
        return train_loader, val_loader, test_loader

    def train_epoch(self, train_loader: DataLoader) -> float:
        """Run one training epoch. Returns average training loss."""
        self.model.train()
        total_loss = 0.0
        n_batches = 0

        for X_batch, y_batch in train_loader:
            X_batch = X_batch.to(self.device)
            y_batch = y_batch.to(self.device)

            self.optimizer.zero_grad()
            predictions = self.model(X_batch)

            # Match output dimensions to target
            if predictions.shape[1] > y_batch.shape[1]:
                predictions = predictions[:, : y_batch.shape[1]]

            loss = self.criterion(predictions, y_batch)
            loss.backward()

            # Gradient clipping to prevent exploding gradients
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)

            self.optimizer.step()
            total_loss += loss.item()
            n_batches += 1

        return total_loss / max(n_batches, 1)

    @torch.no_grad()
    def validate(self, val_loader: DataLoader) -> float:
        """Run validation. Returns average validation loss."""
        self.model.eval()
        total_loss = 0.0
        n_batches = 0

        for X_batch, y_batch in val_loader:
            X_batch = X_batch.to(self.device)
            y_batch = y_batch.to(self.device)

            predictions = self.model(X_batch)
            if predictions.shape[1] > y_batch.shape[1]:
                predictions = predictions[:, : y_batch.shape[1]]

            loss = self.criterion(predictions, y_batch)
            total_loss += loss.item()
            n_batches += 1

        return total_loss / max(n_batches, 1)

    def train(
        self, train_loader: DataLoader, val_loader: DataLoader
    ) -> Dict:
        """
        Full training loop with early stopping and checkpointing.
        """
        logger.info("=" * 60)
        logger.info(f"Training on {self.device} for {self.epochs} epochs")
        logger.info("=" * 60)

        start_time = time.time()

        for epoch in range(1, self.epochs + 1):
            train_loss = self.train_epoch(train_loader)
            val_loss = self.validate(val_loader)

            current_lr = self.optimizer.param_groups[0]["lr"]
            self.history["train_loss"].append(train_loss)
            self.history["val_loss"].append(val_loss)
            self.history["lr"].append(current_lr)

            # Learning rate scheduling
            self.scheduler.step(val_loss)

            # Checkpointing
            if val_loss < self.best_val_loss:
                self.best_val_loss = val_loss
                self.patience_counter = 0
                self.save_checkpoint("cnn_lstm_aqi.pth")
                marker = " ✓ (saved)"
            else:
                self.patience_counter += 1
                marker = ""

            if epoch % 5 == 0 or epoch == 1:
                logger.info(
                    f"Epoch {epoch:3d}/{self.epochs} | "
                    f"Train Loss: {train_loss:.6f} | "
                    f"Val Loss: {val_loss:.6f} | "
                    f"LR: {current_lr:.2e}{marker}"
                )

            # Early stopping
            if self.patience_counter >= self.patience:
                logger.info(f"Early stopping at epoch {epoch} (patience={self.patience})")
                break

        elapsed = time.time() - start_time
        logger.info(f"Training complete in {elapsed:.1f}s. Best val loss: {self.best_val_loss:.6f}")

        return self.history

    @torch.no_grad()
    def evaluate(self, test_loader: DataLoader) -> Dict:
        """
        Evaluate model on the test set using RMSE, MAE, R, R².
        """
        self.model.eval()
        all_preds = []
        all_targets = []

        for X_batch, y_batch in test_loader:
            X_batch = X_batch.to(self.device)
            predictions = self.model(X_batch).cpu().numpy()

            if predictions.shape[1] > y_batch.shape[1]:
                predictions = predictions[:, : y_batch.shape[1]]

            all_preds.append(predictions)
            all_targets.append(y_batch.numpy())

        y_pred = np.concatenate(all_preds, axis=0)
        y_true = np.concatenate(all_targets, axis=0)

        # Use available target names
        n_targets = y_true.shape[1]
        target_names = self.TARGET_NAMES[:n_targets]

        metrics = evaluate_model(y_true, y_pred, target_names)

        logger.info("=" * 60)
        logger.info("Test Set Evaluation Results")
        logger.info("=" * 60)
        for name, m in metrics.items():
            logger.info(
                f"  {name:8s} | RMSE: {m['rmse']:.4f} | MAE: {m['mae']:.4f} | "
                f"R: {m['r']:.4f} | R²: {m['r2']:.4f}"
            )

        return metrics

    def save_checkpoint(self, filename: str):
        """Save model weights and training metadata."""
        path = os.path.join(self.save_dir, filename)
        torch.save(self.model.state_dict(), path)

        # Save training metadata
        meta_path = os.path.join(self.save_dir, "training_metadata.json")
        metadata = {
            "best_val_loss": self.best_val_loss,
            "epochs_trained": len(self.history["train_loss"]),
            "model_config": str(self.model),
        }
        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=2)

    def load_checkpoint(self, filename: str):
        """Load model weights from checkpoint."""
        path = os.path.join(self.save_dir, filename)
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        logger.info(f"Loaded checkpoint from {path}")


# ─────────────────────────────────────────────────────────────────
# Main Training Script
# ─────────────────────────────────────────────────────────────────
def main():
    """Run the full training pipeline."""
    logger.info("=" * 60)
    logger.info("ISRO AQI CNN-LSTM Training Pipeline")
    logger.info("=" * 60)

    # Step 1: Data Pipeline
    pipeline = DataPipeline()
    X, y = pipeline.run_pipeline()

    # Step 2: Build Model
    config = {
        "input_features": X.shape[2],
        "lstm_hidden": 128,
        "lstm_layers": 2,
        "num_outputs": y.shape[1],
        "dropout": 0.3,
        "use_spatial": False,
    }
    model = build_model(config)

    # Step 3: Train
    trainer = Trainer(
        model=model,
        learning_rate=1e-3,
        epochs=50,
        batch_size=32,
        patience=10,
    )

    train_loader, val_loader, test_loader = trainer.prepare_data(X, y)
    history = trainer.train(train_loader, val_loader)

    # Step 4: Evaluate
    metrics = trainer.evaluate(test_loader)

    # Save metrics
    metrics_path = os.path.join(trainer.save_dir, "evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    logger.info(f"Metrics saved to {metrics_path}")

    return metrics


if __name__ == "__main__":
    main()
