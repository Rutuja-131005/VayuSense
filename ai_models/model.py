"""
CNN-LSTM Hybrid Model Architecture
=====================================
Combines Convolutional Neural Networks for spatial feature extraction
with Long Short-Term Memory networks for temporal sequence modeling.

Architecture Overview
----------------------
Input → CNN Block (spatial features) → Flatten → Concatenate with
meteorological features → LSTM Block (temporal dynamics) →
Fully Connected → Multi-output (PM2.5, NO2, SO2, CO, O3)

Mathematical Foundation
------------------------
CNN Convolution:
    y = σ(W * x + b)
    where W = learnable kernel, * = convolution operator, σ = ReLU

LSTM Cell:
    fₜ = σ(W_f · [h_{t-1}, xₜ] + b_f)       (forget gate)
    iₜ = σ(W_i · [h_{t-1}, xₜ] + b_i)       (input gate)
    C̃ₜ = tanh(W_C · [h_{t-1}, xₜ] + b_C)    (candidate cell state)
    Cₜ = fₜ ⊙ C_{t-1} + iₜ ⊙ C̃ₜ             (cell state update)
    oₜ = σ(W_o · [h_{t-1}, xₜ] + b_o)       (output gate)
    hₜ = oₜ ⊙ tanh(Cₜ)                       (hidden state)

Loss Function:
    L = MSE(ŷ, y) = (1/n) Σᵢ (ŷᵢ - yᵢ)²
"""

import torch
import torch.nn as nn


class SpatialCNNBlock(nn.Module):
    """
    CNN block for extracting spatial features from satellite raster patches.

    Applies multiple convolutional layers with batch normalization
    and max pooling to learn spatial patterns (urban-rural gradients,
    topographic effects, regional emission patterns).
    """

    def __init__(self, in_channels: int = 1, out_features: int = 64):
        super().__init__()
        self.conv_layers = nn.Sequential(
            # Conv Layer 1: Detect local patterns
            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            # Conv Layer 2: Detect regional patterns
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),

            # Conv Layer 3: Detect large-scale patterns
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((2, 2)),
        )

        self.flatten = nn.Flatten()
        self.fc = nn.Linear(128 * 2 * 2, out_features)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Parameters
        ----------
        x : Tensor, shape (batch, channels, height, width)
            Satellite raster patch.

        Returns
        -------
        Tensor, shape (batch, out_features)
            Spatial feature vector.
        """
        x = self.conv_layers(x)
        x = self.flatten(x)
        x = self.relu(self.fc(x))
        return x


class TemporalLSTMBlock(nn.Module):
    """
    LSTM block for modeling temporal dynamics in air quality.

    Captures patterns such as:
    - Diurnal cycles (rush-hour traffic, nighttime cooling)
    - Weekly patterns (weekday vs. weekend emissions)
    - Seasonal trends (winter inversion, monsoon washout)
    - Meteorological events (dust storms, cold waves)
    """

    def __init__(
        self,
        input_size: int = 128,
        hidden_size: int = 128,
        num_layers: int = 2,
        dropout: float = 0.2,
    ):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.layer_norm = nn.LayerNorm(hidden_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Parameters
        ----------
        x : Tensor, shape (batch, seq_len, input_size)
            Temporal sequence of feature vectors.

        Returns
        -------
        Tensor, shape (batch, hidden_size)
            Final hidden state encoding the temporal context.
        """
        output, (h_n, c_n) = self.lstm(x)
        # Use the last timestep output
        last_output = output[:, -1, :]
        return self.layer_norm(last_output)


class CNNLSTM_AQI(nn.Module):
    """
    Complete CNN-LSTM Hybrid Model for Surface AQI Prediction.

    This model jointly processes:
    1. Spatial satellite rasters (via CNN) — when available
    2. Temporal sequences of tabular features (via LSTM)

    And outputs predicted surface concentrations for 5 pollutants.

    Parameters
    ----------
    input_features : int
        Number of input features per timestep (satellite + met).
    spatial_channels : int
        Number of channels in satellite raster input.
    cnn_out_features : int
        CNN spatial feature vector dimensionality.
    lstm_hidden : int
        LSTM hidden state size.
    lstm_layers : int
        Number of stacked LSTM layers.
    num_outputs : int
        Number of prediction targets (default 5: PM2.5, NO2, SO2, CO, O3).
    """

    def __init__(
        self,
        input_features: int = 9,
        spatial_channels: int = 1,
        cnn_out_features: int = 64,
        lstm_hidden: int = 128,
        lstm_layers: int = 2,
        num_outputs: int = 5,
        dropout: float = 0.3,
        use_spatial: bool = False,
    ):
        super().__init__()
        self.use_spatial = use_spatial

        # Spatial CNN (optional — used when satellite raster patches are available)
        if use_spatial:
            self.spatial_cnn = SpatialCNNBlock(
                in_channels=spatial_channels,
                out_features=cnn_out_features,
            )
            lstm_input_size = input_features + cnn_out_features
        else:
            self.spatial_cnn = None
            lstm_input_size = input_features

        # Temporal LSTM
        self.temporal_lstm = TemporalLSTMBlock(
            input_size=lstm_input_size,
            hidden_size=lstm_hidden,
            num_layers=lstm_layers,
            dropout=dropout,
        )

        # Prediction head
        self.prediction_head = nn.Sequential(
            nn.Linear(lstm_hidden, 64),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(inplace=True),
            nn.Linear(32, num_outputs),
        )

    def forward(
        self,
        x_temporal: torch.Tensor,
        x_spatial: torch.Tensor = None,
    ) -> torch.Tensor:
        """
        Forward pass through the CNN-LSTM model.

        Parameters
        ----------
        x_temporal : Tensor, shape (batch, seq_len, input_features)
            Temporal sequence of tabular features.
        x_spatial : Tensor, shape (batch, seq_len, channels, H, W), optional
            Satellite raster patches per timestep.

        Returns
        -------
        Tensor, shape (batch, num_outputs)
            Predicted pollutant concentrations.
        """
        batch_size, seq_len, _ = x_temporal.shape

        if self.use_spatial and x_spatial is not None and self.spatial_cnn is not None:
            # Process each timestep's spatial patch through CNN
            spatial_features = []
            for t in range(seq_len):
                patch = x_spatial[:, t, :, :, :]  # (batch, C, H, W)
                sf = self.spatial_cnn(patch)       # (batch, cnn_out)
                spatial_features.append(sf)

            # Stack spatial features: (batch, seq_len, cnn_out)
            spatial_seq = torch.stack(spatial_features, dim=1)

            # Concatenate with temporal features
            combined = torch.cat([x_temporal, spatial_seq], dim=2)
        else:
            combined = x_temporal

        # Pass through LSTM
        temporal_out = self.temporal_lstm(combined)

        # Predict
        predictions = self.prediction_head(temporal_out)

        return predictions


def build_model(config: dict = None) -> CNNLSTM_AQI:
    """
    Factory function to build the CNN-LSTM model with default or custom config.

    Parameters
    ----------
    config : dict, optional
        Model hyperparameters.

    Returns
    -------
    CNNLSTM_AQI
        Initialized model instance.
    """
    default_config = {
        "input_features": 9,
        "spatial_channels": 1,
        "cnn_out_features": 64,
        "lstm_hidden": 128,
        "lstm_layers": 2,
        "num_outputs": 5,
        "dropout": 0.3,
        "use_spatial": False,
    }
    if config:
        default_config.update(config)

    model = CNNLSTM_AQI(**default_config)

    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Model built: {total_params:,} total params, {trainable_params:,} trainable")

    return model


if __name__ == "__main__":
    # Quick test
    model = build_model()
    x = torch.randn(4, 7, 9)  # batch=4, seq_len=7, features=9
    out = model(x)
    print(f"Input shape:  {x.shape}")
    print(f"Output shape: {out.shape}")
    print(f"Sample output: {out[0].detach().numpy()}")
