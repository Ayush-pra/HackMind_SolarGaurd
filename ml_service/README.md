# Solar Inverter ML Service

FastAPI service for real-time risk prediction of solar inverters.

## Setup

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Place the model files in the same directory:
   - main_risk_classifier.pkl
   - main_risk_regressor.pkl
   - main_label_encoder.pkl

3. Run the service:
   ```bash
   python main.py
   ```

The service will start on http://localhost:8000

## API

### POST /predict

Predicts risk class and score based on telemetry features.

**Request Body:**

```json
{
  "power": 100.0,
  "temp": 25.0,
  "efficiency": 0.95,
  "power_drop": -0.01,
  "voltage_dev": 0.5,
  "current_dev": 0.2,
  "current_imbalance": 0.1,
  "voltage_imbalance": 0.05,
  "power_std_6h": 5.0,
  "efficiency_trend": 0.92,
  "op_state": "Running"
}
```

**Response:**

```json
{
  "risk_class": "No Risk",
  "risk_score": 15.5
}
```

**Valid risk_class values:**

- `"No Risk"`
- `"Degradation Risk"`
- `"Shutdown Risk"`

## Models

- **Classifier**: XGBoost model for risk class prediction
- **Regressor**: XGBoost model for risk score prediction
- **Label Encoder**: For categorical feature encoding
