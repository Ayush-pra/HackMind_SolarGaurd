from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd

app = FastAPI(title="Solar Inverter ML Service")

# Load models
try:
    with open('main_risk_classifier.pkl', 'rb') as f:
        classifier = pickle.load(f)
    with open('main_risk_regressor.pkl', 'rb') as f:
        regressor = pickle.load(f)
    with open('main_label_encoder.pkl', 'rb') as f:
        label_encoder = pickle.load(f)
    print("Models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")
    classifier = None
    regressor = None
    label_encoder = None

class Features(BaseModel):
    power: float
    temp: float
    efficiency: float = None
    power_drop: float = None
    voltage_dev: float = None
    current_dev: float = None
    current_imbalance: float = None
    voltage_imbalance: float = None
    power_std_6h: float = None
    efficiency_trend: float = None
    op_state: str

class PredictionResponse(BaseModel):
    risk_class: str
    risk_score: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(features: Features):
    if not classifier or not regressor or not label_encoder:
        raise HTTPException(status_code=500, detail="Models not loaded")

    # Convert to DataFrame
    data = {
        'power': [features.power],
        'temp': [features.temp],
        'efficiency': [features.efficiency],
        'power_drop': [features.power_drop],
        'voltage_dev': [features.voltage_dev],
        'current_dev': [features.current_dev],
        'current_imbalance': [features.current_imbalance],
        'voltage_imbalance': [features.voltage_imbalance],
        'power_std_6h': [features.power_std_6h],
        'efficiency_trend': [features.efficiency_trend],
        'op_state': [features.op_state],
    }
    df = pd.DataFrame(data)

    # Handle missing values (fill with 0 or mean, depending on model training)
    df = df.fillna(0)

    # Encode op_state if needed (assuming label encoder is for op_state)
    if 'op_state' in df.columns:
        df['op_state'] = label_encoder.transform(df['op_state'])

    # Predict
    try:
        risk_class_encoded = classifier.predict(df)[0]
        risk_score = regressor.predict(df)[0]

        # Decode risk_class
        risk_class = label_encoder.inverse_transform([risk_class_encoded])[0]

        return PredictionResponse(risk_class=risk_class, risk_score=float(risk_score))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Solar Inverter ML Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)